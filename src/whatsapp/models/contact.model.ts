/**
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │ @author jrCleber                                                             │
 * │ @filename contact.model.ts                                                   │
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
 * │ @class ContactRaw                                                            │
 * │ @constant contactSchema                                                      │
 * │ @constant ContactModel                                                       │
 * │ @type {IContactModel}                                                        │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │ @important                                                                   │
 * │ For any future changes to the code in this file, it is recommended to        │
 * │ contain, together with the modification, the information of the developer    │
 * │ who changed it and the date of modification.                                 │
 * └──────────────────────────────────────────────────────────────────────────────┘
 */

import { Schema } from 'mongoose';
import { dbserver } from '../../db/db.connect';

export class ContactRaw {
  _id?: string;
  pushName?: string;
  id?: string;
  profilePictureUrl?: string;
  owner: string;
}

const contactSchema = new Schema<ContactRaw>({
  _id: { type: String, _id: true },
  pushName: { type: String, minlength: 1 },
  id: { type: String, required: true, minlength: 1 },
  profilePictureUrl: { type: String, minlength: 1 },
  owner: { type: String, required: true, minlength: 1 },
});

export const ContactModel = dbserver?.model(ContactRaw.name, contactSchema, 'contacts');
export type IContactModel = typeof ContactModel;
