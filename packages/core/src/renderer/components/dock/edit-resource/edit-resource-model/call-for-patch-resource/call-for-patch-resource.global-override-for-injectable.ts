/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "@k8slens/test-utils";
import callForPatchResourceInjectable from "./call-for-patch-resource.injectable";

export default getGlobalOverride(callForPatchResourceInjectable, () => () => {
  throw new Error(
    "Tried to call patching of kube resource without explicit override.",
  );
});
