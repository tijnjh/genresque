import { AOTY } from "../../../../packages/aoty-api/src";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const getUserFollowerCount = createServerFn()
  .validator(v.string())
  .handler(async ({ data }) => {
    const client = new AOTY();

    return client.user_follower_count(data);
  });
