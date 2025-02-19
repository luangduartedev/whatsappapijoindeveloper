/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ @author jrCleber                                                             │
 * │ @filename sendMessage.controller.ts                                          │
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
 * │ @constructs SendMessageController                                            │
 * │ @param {WAMonitoringService} waMonit                                         │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @important                                                                   │
 * │ For any future changes to the code in this file, it is recommended to        │
 * │ contain, together with the modification, the information of the developer    │
 * │ who changed it and the date of modification.                                 │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import { isBase64, isNumberString, isURL } from 'class-validator';
import { BadRequestException } from '../../exceptions';
import { InstanceDto } from '../dto/instance.dto';
import {
  AudioMessageFileDto,
  MediaFileDto,
  SendAudioDto,
  SendContactDto,
  SendLocationDto,
  SendMediaDto,
  SendReactionDto,
  SendTextDto,
} from '../dto/sendMessage.dto';
import { WAMonitoringService } from '../services/monitor.service';

export class SendMessageController {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async sendText({ codigodopedido }: InstanceDto, data: SendTextDto) {
    return await this.waMonitor.waInstances[codigodopedido].textMessage(data);
  }

  public async sendMedia({ codigodopedido }: InstanceDto, data: SendMediaDto) {
    if (isBase64(data?.mediaMessage?.media)) {
      throw new BadRequestException('Owned media must be a url');
    }
    if (data?.mediaMessage.mediatype === 'document' && !data?.mediaMessage?.fileName) {
      throw new BadRequestException('Enter the file name for the "document" type.');
    }
    if (isURL(data?.mediaMessage?.media as string)) {
      return await this.waMonitor.waInstances[codigodopedido].mediaMessage(data);
    }
  }

  public async sendMediaFile(
    { codigodopedido }: InstanceDto,
    data: MediaFileDto,
    file: Express.Multer.File,
  ) {
    if (data?.delay && !isNumberString(data.delay)) {
      throw new BadRequestException('The "delay" property must have an integer.');
    } else {
      data.delay = Number.parseInt(data?.delay as never);
    }
    return await this.waMonitor.waInstances[codigodopedido].mediaFileMessage(data, file);
  }

  public async sendWhatsAppAudio({ codigodopedido }: InstanceDto, data: SendAudioDto) {
    if (isBase64(data?.audioMessage.audio)) {
      throw new BadRequestException('Owned media must be a url');
    }
    if (isURL(data.audioMessage.audio) || isBase64(data.audioMessage.audio)) {
      return await this.waMonitor.waInstances[codigodopedido].audioWhatsapp(data);
    }
  }

  public async sendWhatsAppAudioFile(
    { codigodopedido }: InstanceDto,
    data: AudioMessageFileDto,
    file: Express.Multer.File,
  ) {
    if (data?.delay && !isNumberString(data.delay)) {
      throw new BadRequestException('The "delay" property must have an integer.');
    } else {
      data.delay = Number.parseInt(data?.delay as never);
    }
    return await this.waMonitor.waInstances[codigodopedido].audioWhatsAppFile(data, file);
  }

  public async sendLocation({ codigodopedido }: InstanceDto, data: SendLocationDto) {
    return await this.waMonitor.waInstances[codigodopedido].locationMessage(data);
  }

  public async sendContact({ codigodopedido }: InstanceDto, data: SendContactDto) {
    return await this.waMonitor.waInstances[codigodopedido].contactMessage(data);
  }

  public async sendReaction({ codigodopedido }: InstanceDto, data: SendReactionDto) {
    if (!data.reactionMessage.reaction.match(/[^\(\)\w\sà-ú"-\+]+/)) {
      throw new BadRequestException('"reaction" must be an emoji');
    }
    return await this.waMonitor.waInstances[codigodopedido].reactionMessage(data);
  }
}
