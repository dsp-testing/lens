/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import publishIsConfiguredInjectable from "./publish-is-configured.injectable";

export default getGlobalOverride(publishIsConfiguredInjectable, () => false);
