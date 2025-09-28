"use strict";

module.exports = {
  async bootstrap({ strapi }) {
    // Ensure public role has read access to posts/photos
    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });
    if (role) {
      const perms = role.permissions || {};
      const ensureGet = (uid) => {
        perms[uid] = perms[uid] || { controllers: {} };
        const c = perms[uid].controllers;
        c.find = c.find || { enabled: true };
        c.findOne = c.findOne || { enabled: true };
      };
      ensureGet("api::post.post");
      ensureGet("api::photo.photo");
      await strapi.query("plugin::users-permissions.role").update({
        where: { id: role.id },
        data: { permissions: perms },
      });
    }
  },
};
