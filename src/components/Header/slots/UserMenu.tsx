import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { CurrentUser } from "../types";
import { LogoutIcon, UserIcon } from "../icons";

export interface UserMenuProps {
  user: CurrentUser;
  onProfile?: () => void;
  onLogout?: () => void;
}

export function UserMenu({ user, onProfile, onLogout }: UserMenuProps) {
  return (
    <Menu>
      <MenuButton className="ds-user-button" aria-label={`Account menu for ${user.name}`}>
        <span className="ds-user-avatar">{user.initials}</span>
      </MenuButton>
      <MenuItems className="ds-user-menu" anchor="bottom end" transition>
        <div className="ds-user-menu__header">
          <div className="ds-user-menu__name">{user.name}</div>
          <div className="ds-user-menu__email">{user.email}</div>
        </div>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              className="ds-user-menu__item"
              data-focus={focus || undefined}
              onClick={onProfile}
            >
              <UserIcon />
              <span>Profile</span>
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              className="ds-user-menu__item ds-user-menu__item--danger"
              data-focus={focus || undefined}
              onClick={onLogout}
            >
              <LogoutIcon />
              <span>Logout</span>
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
