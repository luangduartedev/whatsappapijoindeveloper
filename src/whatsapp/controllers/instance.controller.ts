/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ @author jrCleber                                                             │
 * │ @filename instance.controller.ts                                             │
 * │ Developed by: Cleber Wilson                                                  │
 * │ Creation date: Jul 17, 2022                                                  │
 * │ Contact: contato@joindeveloper.dev                                                │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @copyright © Cleber Wilson 2022. All rights reserved.                        │
 * │ Licensed under the Apache License, Version 2.0                               │
 * │                                                                              │
 * │  @license "https://github.com/code-chat-br/whatsapp-api/blob/main/LICENSE"   │
 * │                                                                              │
 * │ You may not use this file except in compliance with the License.             │
 * │ You may obtain a copy of the License at                                      │
 * │                                                                              │
 * │    http://www.apache.org/licenses/LICENSE-2.0                                │
 * │                                                                              │
 * │ Unless required by applicable law or agreed to in writing, software          │
 * │ distributed under the License is distributed on an "AS IS" BASIS,            │
 * │ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
 * │                                                                              │
 * │ See the License for the specific language governing permissions and          │
 * │ limitations under the License.                                               │
 * │                                                                              │
 * │ @class                                                                       │
 * │ @constructs InstanceController                                               │
 * │ @param {WAMonitoringService} waMonit                                         │
 * │ @param {ConfigService} configService                                         │
 * │ @param {RepositoryBroker} repository                                         │
 * │ @param {EventEmitter2} eventEmitter                                          │
 * │ @param {AuthService} authService                                             │
 * │ @param {RedisCache} cache                                                    │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @important                                                                   │
 * │ For any future changes to the code in this file, it is recommended to        │
 * │ contain, together with the modification, the information of the developer    │
 * │ who changed it and the date of modification.                                 │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import { delay } from '@whiskeysockets/baileys';
import EventEmitter2 from 'eventemitter2';
import { ConfigService } from '../../config/env.config';
import { BadRequestException, InternalServerErrorException } from '../../exceptions';
import { InstanceDto } from '../dto/instance.dto';
import { RepositoryBroker } from '../repository/repository.manager';
import { AuthService, OldToken } from '../services/auth.service';
import { WAMonitoringService } from '../services/monitor.service';
import { WAStartupService } from '../services/whatsapp.service';
import { Logger } from '../../config/logger.config';
import { RedisCache } from '../../db/redis.client';
import { Request } from 'express';

export class InstanceController {
  constructor(
    private readonly waMonitor: WAMonitoringService,
    private readonly configService: ConfigService,
    private readonly repository: RepositoryBroker,
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly cache: RedisCache,
  ) {}

  private readonly logger = new Logger(InstanceController.name);

  public async createInstance({ codigodopedido }: InstanceDto, req: Request) {
    try {
      const instance = new WAStartupService(
        this.configService,
        this.eventEmitter,
        this.repository,
        this.cache,
      );
      instance.codigodopedido = codigodopedido;
      this.waMonitor.waInstances[instance.codigodopedido] = instance;
      this.waMonitor.delInstanceTime(instance.codigodopedido);

      const hash = await this.authService.generateHash({
        codigodopedido: instance.codigodopedido,
      });

      req.session[instance.codigodopedido] = Buffer.from(JSON.stringify(hash)).toString(
        'base64',
      );

      return {
        instance: {
          codigodopedido: instance.codigodopedido,
          status: 'created',
        },
        hash,
      };
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async reloadConnection({ codigodopedido }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[codigodopedido];
      const state = instance?.connectionStatus?.state;

      switch (state) {
        case 'open':
          await instance.reloadConnection();
          await delay(2000);
          return await this.connectionState({ codigodopedido });
        default:
          return await this.connectionState({ codigodopedido });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async connectToWhatsapp({ codigodopedido }: InstanceDto) {
    try {
      const instance = this.waMonitor.waInstances[codigodopedido];
      const state = instance?.connectionStatus?.state;

      switch (state) {
        case 'close':
          await instance.connectToWhatsapp();
          await delay(2000);
          return instance.qrCode;
        case 'connecting':
          return instance.qrCode;
        default:
          return await this.connectionState({ codigodopedido });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async connectionState({ codigodopedido }: InstanceDto) {
    return this.waMonitor.waInstances[codigodopedido].connectionStatus;
  }

  public async buscarInstancia({ codigodopedido }: InstanceDto) {
    if (codigodopedido) {
      return this.waMonitor.instanceInfo(codigodopedido);
    }

    return { error: true, message: 'You must to fill a codigodopedido name in request URL' };
  }

  public async logout({ codigodopedido }: InstanceDto) {
    try {
      await this.waMonitor.waInstances[codigodopedido]?.client?.logout(
        'Log out instance: ' + codigodopedido,
      );
      var instanceObject = new InstanceDto();
      instanceObject.codigodopedido = codigodopedido;

      await this.createInstance(instanceObject, null);
      return { error: false, message: 'Instance logged out' };
    } catch (error) {
      throw new InternalServerErrorException(error.toString());
    }
  }

  public async deleteInstance({ codigodopedido }: InstanceDto) {
    const stateConn = await this.connectionState({ codigodopedido });
    if (stateConn.state === 'open') {
      throw new BadRequestException([
        'Deletion failed',
        'The instance needs to be disconnected',
      ]);
    }
    try {
      delete this.waMonitor.waInstances[codigodopedido];
      return { error: false, message: 'Instance deleted' };
    } catch (error) {
      throw new BadRequestException(error.toString());
    }
  }

  public async refreshToken(instance: InstanceDto, oldToken: OldToken, req: Request) {
    const token = await this.authService.refreshToken(oldToken);

    req.session[instance.codigodopedido] = Buffer.from(JSON.stringify(token)).toString(
      'base64',
    );
  }
}
