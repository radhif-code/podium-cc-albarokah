# Podium GEMASS

Requested: retain the light pastel quiz identity; separate a projector-only fullscreen podium from an operator tab; synchronize scores and configuration; manually trigger a five-second overlay after a question is read; allow missing header logos to be supplied.

Implementation decisions: use React/Vite static output for portable Vercel deployment. The default URL displays the podium; `?view=operator` provides controls. Tabs share localStorage on the same origin, browser profile, and computer. No cross-device control is implied. All four header logos are editable uploads; absent logos are hidden rather than fabricated. Scores, teams, logos, and timer deadlines survive refresh. Timer visibility is computed from an absolute deadline and disappears after five seconds. Display controls auto-hide. Fit the entire stage to projector dimensions. Retain light pastel colors, team customization, scoring buttons, animated scores and rank changes.

Alternative: hosted server synchronization would allow different devices but requires authentication and additional backend configuration beyond the requested separate-tab workflow. Use browser-tab synchronization here.
