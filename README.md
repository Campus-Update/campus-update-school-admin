# Campus Update — Super Admin Dashboard

React + Vite + Tailwind implementation of the Super admin dashboard (Figma file `Q6j1UvZdZom5quoburcZa9`).

## Run

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # production build (CI check)
```

## Screens

| Page | Route (hash) | Figma frame |
| --- | --- | --- |
| Overview (zero states) | `#/` | 670:563 area |
| Users | `#/users` | 710:10597 |

The School administrators screen is owned by another developer and is not part of this branch
(a reference implementation lives outside the repo if needed).

## Structure

```
src/
  App.jsx                     # hash routing between pages
  components/admin/
    Sidebar.jsx               # full nav (Publishing / Commercial / Government)
    Topbar.jsx                # page title + subtitle + bell + profile chip
    OverviewPage.jsx          # Overview zero-states screen
    UsersPage.jsx             # Users table, filters, chips, dept. stats
    modals.jsx                # User modals: Assign Institution, Suspend, Deactivate (+ shared admin modal set)
    ui.jsx                    # StatCard, StatusBadge, AvatarChip, footer, filters, fields
    Icons.jsx                 # inline SVG icon set
public/
  logo-admin.svg
  images/avatar-john.png
```

Navigation between pages is state + hash based (`#/users`); sidebar Overview / Users are wired,
the rest are placeholders for future work.
