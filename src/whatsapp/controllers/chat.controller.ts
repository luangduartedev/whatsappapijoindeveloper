/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ @author jrCleber                                                             │
 * │ @filename chat.controller.ts                                                 │
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
 * │ @constructs ChatController                                                   │
 * │ @param {WAMonitoringService} waMonit                                         │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @important                                                                   │
 * │ For any future changes to the code in this file, it is recommended to        │
 * │ contain, together with the modification, the information of the developer    │
 * │ who changed it and the date of modification.                                 │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import { proto } from '@whiskeysockets/baileys';
import {
  ArchiveChatDto,
  DeleteMessage,
  NumberDto,
  ReadMessageDto,
  WhatsAppNumberDto,
} from '../dto/chat.dto';
import { InstanceDto } from '../dto/instance.dto';
import { ContactQuery } from '../repository/contact.repository';
import { MessageQuery } from '../repository/message.repository';
import { MessageUpQuery } from '../repository/messageUp.repository';
import { WAMonitoringService } from '../services/monitor.service';

export class ChatController {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async whatsappNumber({ codigodopedido }: InstanceDto, data: WhatsAppNumberDto) {
    return await this.waMonitor.waInstances[codigodopedido].whatsappNumber(data);
  }

  public async readMessage({ codigodopedido }: InstanceDto, data: ReadMessageDto) {
    return await this.waMonitor.waInstances[codigodopedido].markMessageAsRead(data);
  }

  public async archiveChat({ codigodopedido }: InstanceDto, data: ArchiveChatDto) {
    return await this.waMonitor.waInstances[codigodopedido].archiveChat(data);
  }

  public async deleteMessage({ codigodopedido }: InstanceDto, data: DeleteMessage) {
    return await this.waMonitor.waInstances[codigodopedido].deleteMessage(data);
  }

  public async fetchProfilePicture({ codigodopedido }: InstanceDto, data: NumberDto) {
    return await this.waMonitor.waInstances[codigodopedido].profilePicture(data.number);
  }

  public async fetchContacts({ codigodopedido }: InstanceDto, query: ContactQuery) {
    return await this.waMonitor.waInstances[codigodopedido].fetchContacts(query);
  }

  /**
   *
   * @deprecated
   */
  public async getBase64FromMediaMessage(
    { codigodopedido }: InstanceDto,
    message: proto.IWebMessageInfo,
  ) {
    return await this.waMonitor.waInstances[codigodopedido].getMediaMessage(message, true);
  }

  public async getBinaryMediaFromMessage(
    { codigodopedido }: InstanceDto,
    message: proto.IWebMessageInfo,
  ) {
    return await this.waMonitor.waInstances[codigodopedido].getMediaMessage(message);
  }

  public async fetchMessages({ codigodopedido }: InstanceDto, query: MessageQuery) {
    return await this.waMonitor.waInstances[codigodopedido].fetchMessages(query);
  }

  public async fetchStatusMessage({ codigodopedido }: InstanceDto, query: MessageUpQuery) {
    return await this.waMonitor.waInstances[codigodopedido].fetchStatusMessage(query);
  }

  public async fetchChats({ codigodopedido }: InstanceDto) {
    return await this.waMonitor.waInstances[codigodopedido].fetchChats();
  }
}
