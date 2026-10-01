# Changelog

All notable changes to this package. It follows [Semantic Versioning](https://semver.org/).

## 1.0.0 - 2026-10-01

### Breaking

- `FaceConfig` has a new required field, `hairTone`. Code that builds configs
  by hand has to add it; configs stored before 1.0 have no `hairTone` and
  still render, as light hair.
- `Hair` and `Hat` have new members (see below), so exhaustive switches over
  them no longer compile.
- Seeds roll differently. The old roll is unchanged and the new options are
  rolled after it, so eyes, nose, proportions and everything else stay put,
  but about a third of all seeds now get a different hairstyle or head
  covering, and 60 % get mid or dark hair: about 71 % of seeds look
  different. A test pins the 0.1 faces so later releases change nothing by
  accident.
- Configs with a beanie, cap or brimmed hat render differently: hair no
  longer sticks out over the top of the hat (see Fixed).
- The `<svg>` may now contain a `<defs>` with clip paths. Their ids start
  with `pencil-face-` and are derived from the config, so the same face twice
  in a page shares identical clips and different faces never collide.

### Added

- Head coverings `hijab`, `turban`, `kippah` and `fez`. A hijab covers hair,
  ears and neck (an earring or a pencil behind the ear disappears with
  them); a turban covers the hair. A rolled hijab comes without a beard.
- Hairstyles `locs`, `cornrows`, `ponytail`, `buzz` and `receding`.
- `hairTone`: `light` (the outline as before), `mid` and `dark`, shaded with
  pencil hatching inside the hair. Rolled as 40 / 30 / 30 %.
- `faceFromSeed` takes a string as well as a number, so a user name can be
  the seed.
- The `HairTone` type, and `hairTone` in `FACE_OPTIONS`.

### Fixed

- Voluminous hair (afro, curly, bun, mohawk, spiky) stuck out over the top
  of beanies, caps and brimmed hats. Hair under these hats and the fez is now
  cut to the hat; hair coming out underneath stays, with its cut closed off
  by a line.

## 0.1.0 - 2026-09-26

First release: seeded pencil portraits with head shapes, clothes, eyes,
brows, noses, mouths, marks, beards, twelve hairstyles, four hats, glasses
and extras, plus the pencil filter.
