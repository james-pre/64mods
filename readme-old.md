# Sixty-Four Mod Collection

These are mods for the game Sixty-Four, an idle/clicker/factory game.
You can find the game on Steam: https://store.steampowered.com/app/2659900/Sixty_Four/

All of the mods in this collection require the "Mod Autoloader" as manager. That is the mod provided
in the file `autoloader.js`. To install that mod, follow the official guide on the link above, place
the `autoloader.js` file in the `mods` folder and include that mod - and only that mod! - in the
`index.html` file. The other mods are then loaded automatically.

In the game you will then have a "MODS" menu item where you can configure the mods' settings and
enable/disable the mods.

If you want to create your own mods and have it use the autoloader, there's an example of how to
write a mod in the `demo.js` file. You can use that class as a skeleton - just change the class name,
label, description etc. to suit your own needs.

If you experience bugs or have feature requests you are welcome to drop a comment here or find me on
the Sixty-Four Discord server, https://discord.gg/2Z6tGTpe, under the name "Ziltoid".
