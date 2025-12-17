# Next-Shortcut-Manager (WORK IN PROGRESS)

Next shortcut manager is a Next/React based electron app designed for the use of storing shortcuts to your games and able to quickly launch them.

# What is it?

Effectively a glorified game launcher that I made in Electron, as a bit of background. I have way too many Steam Games and other things installed on my system and searching for them is a bit of a slog.

I wanted to see if I could utilize something like Next.js to solve some of these issues. Whilst I can't utilize all of the SSG features that I wanted. The speed of this application is much faster and smoother than I expected.

There's a lot of things I want to get sorted before packaging it up such as proper documentation on how to add your own launchers and modify the UI as I've tried to keep the functionality fairly simple and easy for someone else to make modifications if needed.

# How to run

To run in dev
`npm run electron:dev`

To run in prod
`npm run start-electron`

# Supported Launchers

At the moment there are up to 4 launchers that are available for use :

- Steam
- EA Desktop (formely Origin)
- Ubisoft Connect
- Epic Games Store

All of these launchers are supported so you can open up the install folder and directly launch the games as well!

Launchers I want to add as well :

- Xbox Launcher
- GOG Games
- Custom Launcher Support as well

# To-Do

- Settings Page needs to be done
  - Want a dev mode
- Add Custom Launcher
  - Want a nice automated way to handle this, maybe take advantage of the Game Type I have
- UI tidy up with Bulma
- Electron Title Bar Redesign
- Navbar fix (its hideous at the moment)

# Images?

I would like to have game cover art and other things however I believe it would require some form of API access and I would effectively need to set up some sort of proxy (unless if I wanted to share my API key (lol this is a joke)).

I'll consider it but I want to make everything else as good as it can be.
