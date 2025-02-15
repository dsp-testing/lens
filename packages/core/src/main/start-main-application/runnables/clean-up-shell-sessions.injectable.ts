/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfBackEndInjectionToken } from "../runnable-tokens/phases";
import { ShellSession } from "../../shell-session/shell-session";

const cleanUpShellSessionsInjectable = getInjectable({
  id: "clean-up-shell-sessions",

  instantiate: () => ({
    run: () => void ShellSession.cleanup(),
  }),

  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default cleanUpShellSessionsInjectable;
