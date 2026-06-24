#!/usr/bin/env bash
# Regenerates the royalty-free ambient music bed at public/music/ambient.mp3.
# Run from the marketing-video/ project root:  bash scripts/generate-music.sh
#
# Uses Remotion's bundled ffmpeg (no system ffmpeg needed). The pad is an
# additive stack of pure sines (a calm Cmaj9 voicing) weighted toward the mids
# so it stays audible on laptop speakers. Because the bundled ffmpeg lacks
# afade/tremolo, the gentle swell + fades are shaped with a single comma-free
# `volume` expression. `loudnorm` (placed BEFORE the fades so it can't fight
# them) normalizes the bed to a consistent, present background level.
set -euo pipefail

mkdir -p public/music

npx remotion ffmpeg -y \
  -f lavfi -i "sine=frequency=130.81:duration=60" \
  -f lavfi -i "sine=frequency=196.00:duration=60" \
  -f lavfi -i "sine=frequency=261.63:duration=60" \
  -f lavfi -i "sine=frequency=329.63:duration=60" \
  -f lavfi -i "sine=frequency=392.00:duration=60" \
  -f lavfi -i "sine=frequency=523.25:duration=60" \
  -f lavfi -i "sine=frequency=587.33:duration=60" \
  -f lavfi -i "sine=frequency=659.25:duration=60" \
  -f lavfi -i "sine=frequency=783.99:duration=60" \
  -filter_complex "[0]volume=0.12[a];[1]volume=0.10[b];[2]volume=0.14[c];[3]volume=0.15[d];[4]volume=0.14[e];[5]volume=0.12[f];[6]volume=0.08[g];[7]volume=0.09[h];[8]volume=0.06[i];[a][b][c][d][e][f][g][h][i]amix=inputs=9:normalize=0[mix];[mix]loudnorm=I=-19:TP=-1.5:LRA=11[ln];[ln]volume='(0.8+0.15*sin(2*PI*0.05*t))*(1-exp(-t/1.0))*(1-exp(-(60-t)/1.5))':eval=frame[lfo];[lfo]aformat=channel_layouts=stereo,aresample=48000[out]" \
  -map "[out]" -t 60 -c:a libmp3lame -b:a 192k public/music/ambient.mp3

echo "✓ Wrote public/music/ambient.mp3"
