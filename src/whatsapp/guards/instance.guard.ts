/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ @author jrCleber                                                             │
 * │ @filename instance.guard.ts                                                  │
 * │ Developed by: Cleber Wilson                                                  │
 * │ Creation date: Nov 27, 2022                                                  │
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
 * │ @function getInstance @property {String} codigodopedido                        │
 * │ @returns {Promise<Boolean>}                                                  │
 * │                                                                              │
 * │ @function instanceExistsGuard                                                │
 * │ @property {Request} req @property {Response} _ @property {NextFunction} next │
 * │ @returns {Promise<void>}                                                     │
 * │                                                                              │
 * │ @function instanceLoggedGuard                                                │
 * │ @property {Request} req @property {Response} _ @property {NextFunction} next │
 * │ @returns {Promise<void>}                                                     │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @important                                                                   │
 * │ For any future changes to the code in this file, it is recommended to        │
 * │ contain, together with the modification, the information of the developer    │
 * │ who changed it and the date of modification.                                 │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import { NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { INSTANCE_DIR } from '../../config/path.config';
import { dbserver } from '../../db/db.connect';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '../../exceptions';
import { InstanceDto } from '../dto/instance.dto';
import { cache, waMonitor } from '../whatsapp.module';
import { Database, Redis, configService } from '../../config/env.config';

async function getInstance(codigodopedido: string) {
  const db = configService.get<Database>('DATABASE');
  const redisConf = configService.get<Redis>('REDIS');

  const exists = !!waMonitor.waInstances[codigodopedido];

  if (redisConf.ENABLED) {
    const keyExists = await cache.keyExists();
    return exists || keyExists;
  }

  if (db.ENABLED) {
    const collection = dbserver
      .getClient()
      .db(db.CONNECTION.DB_PREFIX_NAME + '-instances')
      .collection(codigodopedido);
    return exists || (await collection.find({}).toArray()).length > 0;
  }

  return exists || existsSync(join(INSTANCE_DIR, codigodopedido));
}

export async function instanceExistsGuard(req: Request, _: Response, next: NextFunction) {
  if (
    req.originalUrl.includes('/instancias/createjoindeveloper') ||
    req.originalUrl.includes('/instancias/buscarInstancia')
  ) {
    return next();
  }

  const param = req.params as unknown as InstanceDto;
  if (!param?.codigodopedido) {
    throw new BadRequestException(`codigodopedido not provided. "${param}"`);
  }

  if (!(await getInstance(param.codigodopedido))) {
    throw new NotFoundException(`The "${param.codigodopedido}" instance does not exist`);
  }

  next();
}

export async function instanceLoggedGuard(req: Request, _: Response, next: NextFunction) {
  if (req.originalUrl.includes('/instancias/createjoindeveloper')) {
    const instance = req.body as InstanceDto;
    if (await getInstance(instance.codigodopedido)) {
      throw new ForbiddenException(
        `This name "${instance.codigodopedido}" is already in use.`,
      );
    }

    if (waMonitor.waInstances[instance.codigodopedido]) {
      delete waMonitor.waInstances[instance.codigodopedido];
    }
  }

  next();
}
