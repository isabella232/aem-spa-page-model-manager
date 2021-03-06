/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Constants, { AEM_MODE, TAG_ATTR, TAG_TYPE } from './Constants';
import { PathUtils } from './PathUtils';
import MetaProperty from './MetaProperty';

export class AuthoringUtils {
    private _apiDomain: string | null;

    constructor(domain: string | null) {
        this._apiDomain = domain;
    }

    getApiDomain(): string | null {
        return this._apiDomain;
    }

    /**
     * Returns all the tags for requested state.
     * @returns Serialized tags.
     */
    public getTagsForState(state: string): string {
        let tags = '';

        if (state === Constants.STATE_AUTHORING) {
            const clientLibs = this.generateClientLibUrls();

            tags = clientLibs.map(resource => {
                if (resource.endsWith('.js')) {
                    return this.generateElementString(TAG_TYPE.JS, TAG_ATTR.SRC, resource);
                } else if (resource.endsWith('.css')) {
                    return this.generateElementString(TAG_TYPE.STYLESHEET, TAG_ATTR.HREF, resource);
                }
            }).join('');
        }

        return tags;
    }

    /**
     * Returns string value of all the concatenated tags.
     * @returns Concatenated tags.
     */
    private generateElementString(tagType: string, attr: string, attrValue: string): string {
        let tag = '';

        if (tagType === TAG_TYPE.JS) {
            tag = `<script ${attr}="${attrValue}"></script>`;
        } else if (tagType === TAG_TYPE.STYLESHEET) {
            tag = `<link ${attr}="${attrValue}"/>`;
        }

        return tag;
    }

    /**
     * Checks status of requested state.
     * @returns `true` if requested state is active.
     */
    public static isStateActive(state: string): boolean {
        if (state === Constants.STATE_AUTHORING) {
            const viaMetaProperty = PathUtils.getMetaPropertyValue(MetaProperty.WCM_MODE) === AEM_MODE.EDIT;
            const viaQueryParam = PathUtils.isBrowser() && (AuthoringUtils.getAemMode() === AEM_MODE.EDIT);

            return viaMetaProperty || viaQueryParam;
        }

        return false;
    }

    /**
     * Checks AEM mode.
     * @returns AEM mode or `null`.
     */
    public static getAemMode(): string | null {
        let url: URL;

        try {
            url = new URL(PathUtils.getCurrentURL());
            return url.searchParams.get(Constants.AEM_MODE_KEY);
        } catch (e) {
            // invalid url
        }

        return null;
    }

    /**
     * Generates urls to authoring clientlibs.
     * @returns Clientlib URLs.
     */
    public generateClientLibUrls(): string[] {
        const result: string[] = [];
        const domain = this.getApiDomain();

        if (domain) {
            Constants.AUTHORING_LIBRARIES.forEach((library) => {
                result.push(`${domain}${Constants.EDITOR_CLIENTLIB_PATH}${library}`);
            });
        }

        return result;
    }
}
