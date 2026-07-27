import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { CurrentUser } from '../types';

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
              onClick={onProfile}
              style={focus ? { backgroundColor: 'var(--color-surface-elevated)' } : undefined}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              className="ds-user-menu__item ds-user-menu__item--danger"
              onClick={onLogout}
              style={
                focus
                  ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
                    }
                  : undefined
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
