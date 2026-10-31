# NEON REQUIEM (vertical slice)
Top-down neo-noir action shooter, HTML5 Canvas + vanilla JS, zero dependencies, all art/audio procedural.

**Run:** open `index.html` in a browser (plain scripts, no server needed). Optional: `python3 -m http.server`.

**Desktop:** WASD move · mouse aim · LMB fire · RMB precise aim · Space melee · Shift dodge · R reload · Q swap weapon · E use (doors, pick up weapons) · Esc pause. All keys except Esc can be changed in Settings > Key bindings.
**Sandevistan (F):** toggle on/off, no cooldown and no time limit. Slow-mo (everything but you at 5% speed), Crimson-Dot-style effect (flash + cyan wipe, teal wash, long colour-aged afterimage chain that follows you and vanishes only when you switch it off), +50% move speed while active.
**Cyberpsycho:** the gauge under SANDE fills over 10 s of Sandevistan use and drains over 15 s when it is off. When full, Sandevistan is forced off and you go psycho until the gauge empties: no control, you stagger after the nearest enemy, shoot and swing at it, and bleed 2 HP/s only while the ghost copies (shadows) are visible. Tunables are in `CY` (`js/game.js`).
**Mobile:** left half = move stick, right half = aim stick (auto-fire when pushed far) + buttons on the right edge.

**Included:** 5 missions, 4 guns (pistol, SMG, shotgun, assault rifle) + melee, Rusher and Elite enemies, doors, crates/barrels, intel, guard/heavy/marksman AI (patrol/alert/chase/attack/search, LOS, hearing, alert sharing), combo scoring and ranks, menus, settings, localStorage saves.
**Accessibility/effects:** Reduce flashing and Reduce motion switches (Reduce motion starts on only if the system asks for reduced motion), chromatic aberration on damage and nearby blasts with an intensity slider, steady red screen-edge cue when flashing is reduced.
**Enemy navigation:** A* pathfinding (`js/nav.js`) routes enemies around walls, furniture and crates and through doors, which they open on the way; a stuck watchdog repaths and gives up instead of pushing at a wall; gunners reposition when low cover blocks their line of fire and flip strafe direction when blocked.
**Not yet done:** environmental weapons, rebinding Esc or the mouse buttons. Extraction is still automatic.
**Tested:** scripted Chromium runs (desktop, landscape phone and portrait phone emulation) covering settings, key rebinding, pickups, HUD layout, and all five missions loading and running. Feel and performance on real devices are not measured.
**Cyberpsycho screen glitch:** `cyGlitch()` in `js/renderer.js`: sliced/shifted bands, cyan/magenta/red tinted bands and scanlines with a rolling bright bar. Strong while the ghosts are visible, faint and intermittent when they are gone. Off with Reduce motion; half strength with Reduce flashing.
**Gunshot hearing:** patrolling enemies in the same room as the shooter (area enclosed by walls and doors) hear gunshots at 2x range (`ROOM_HEAR` in `js/enemy-ai.js`, rooms from `roomMap` in `js/missions.js`). Other noises and other rooms are unchanged.

**Sound:** gunshots (pistol, SMG, rifle, shotgun, enemy fire), reload, explosions, Sandevistan on/off and Cyberpsycho start/end and ghost/glitch bursts are embedded samples (`js/sfx-data.js`, mono mp3 base64, works from file://) mapped in `SFX_MAP` at the top of `js/audio.js`; all other sounds and the music stay procedural synth. Credits: Snake's Authentic Gun Sounds, JDSherbert Pixel Explosions SFX Pack, Glitch Noises / Misc Noises (VZ_GN).

**Cyberpsycho hallucinations:** each glitch burst spawns 3 fake enemies (`js/phantoms.js`, `PH` tunables at the top) that look like real enemies plus glitch slices and walk toward the player. They are not in the enemy list: no AI, score, kills, alerts or damage to the player. Shots and melee dissolve them, they push the player like a body, non-melee ones fire cosmetic tracers with a gunshot sound (no hit, no damage), and they fade when the burst or the psycho state ends.
