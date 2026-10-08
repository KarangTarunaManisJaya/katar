#!/usr/bin/env python3
"""
Official Emblem Generator for Karang Taruna Kelurahan Manis Jaya
Generates high-resolution PNGs and SVGs with anti-aliasing matching the exact
emblem displayed across the computer and mobile application interface.
Outputs:
- public/logo.svg
- public/favicon.svg
- public/icon-192.png
- public/icon-512.png
- public/assets/icon-192.png
- public/assets/icon-512.png
- public/assets/icon-maskable-512.png
- public/logo.png
"""

import os
import math
import struct
import zlib

def write_png(filename, width, height, pixels):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        raw_data.extend(pixels[y])
    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data), 9))
    iend = chunk(b"IEND", b"")
    with open(filename, "wb") as f:
        f.write(header + ihdr + idat + iend)

# Simple anti-aliased 5x7 bitmap font for rendering text on the emblem
FONT_5X7 = {
    'A': [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
    'B': [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
    'C': [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
    'E': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
    'G': [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
    'I': [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
    'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
    'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
    'M': [0x11, 0x1b, 0x15, 0x11, 0x11, 0x11, 0x11],
    'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
    'R': [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
    'S': [0x0e, 0x11, 0x10, 0x0e, 0x01, 0x11, 0x0e],
    'T': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
    'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
    'Y': [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
    ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
}

def render_logo_image(size=512):
    # We use 2x supersampling for high fidelity rendering
    ss = 2
    W = size * ss
    H = size * ss
    scale = W / 100.0  # reference 100x100 coord system

    # Frame buffer in floats RGBA
    buf_r = [0.0] * (W * H)
    buf_g = [0.0] * (W * H)
    buf_b = [0.0] * (W * H)
    buf_a = [0.0] * (W * H)

    cx = 50.0 * scale
    cy = 50.0 * scale

    # Colors
    c_navy = (30, 58, 138)
    c_darkblue = (23, 37, 84)
    c_blue = (29, 78, 216)
    c_gold = (250, 204, 21)
    c_deepgold = (202, 138, 4)
    c_red = (220, 38, 38)
    c_white = (248, 250, 252)

    def blend_pixel(x, y, r, g, b, a):
        if x < 0 or x >= W or y < 0 or y >= H:
            return
        idx = y * W + x
        cur_a = buf_a[idx]
        out_a = a + cur_a * (1.0 - a)
        if out_a > 0.001:
            buf_r[idx] = (r * a + buf_r[idx] * cur_a * (1.0 - a)) / out_a
            buf_g[idx] = (g * a + buf_g[idx] * cur_a * (1.0 - a)) / out_a
            buf_b[idx] = (b * a + buf_b[idx] * cur_a * (1.0 - a)) / out_a
            buf_a[idx] = out_a

    # Pass 1: Draw circles & shapes
    r_outer = 47.0 * scale
    r_outer_stroke = 2.5 * scale
    r_mid = 39.0 * scale
    r_mid_stroke = 1.8 * scale
    r_inner = 29.0 * scale
    r_inner_stroke = 2.0 * scale

    for y in range(H):
        dy = y - cy
        for x in range(W):
            dx = x - cx
            dist = math.hypot(dx, dy)
            if dist > r_outer + r_outer_stroke * 0.5 + 2.0:
                continue

            # Outer border stroke (Gold)
            if dist <= r_outer + r_outer_stroke * 0.5:
                # Anti-alias edge
                edge_a = min(1.0, max(0.0, (r_outer + r_outer_stroke * 0.5) - dist))
                if dist >= r_outer - r_outer_stroke * 0.5:
                    blend_pixel(x, y, c_gold[0], c_gold[1], c_gold[2], edge_a)
                elif dist > r_mid + r_mid_stroke * 0.5:
                    # Outer navy ring with slight radial gradient
                    t = dist / r_outer
                    nr = int(c_navy[0] * (1.0 - t * 0.2))
                    ng = int(c_navy[1] * (1.0 - t * 0.2))
                    nb = int(c_navy[2] * (1.0 - t * 0.2))
                    blend_pixel(x, y, nr, ng, nb, 1.0)

            # Mid ring stroke (Gold)
            if dist <= r_mid + r_mid_stroke * 0.5 and dist >= r_mid - r_mid_stroke * 0.5:
                # Dashed feel
                angle = math.atan2(dy, dx)
                dash = int(angle * 12) % 2 == 0
                blend_pixel(x, y, c_gold[0], c_gold[1], c_gold[2], 0.95 if dash else 0.7)
            elif dist < r_mid - r_mid_stroke * 0.5 and dist > r_inner + r_inner_stroke * 0.5:
                # Mid ring fill (Royal Blue)
                blend_pixel(x, y, c_blue[0], c_blue[1], c_blue[2], 1.0)

            # Inner ring stroke (Gold)
            if dist <= r_inner + r_inner_stroke * 0.5 and dist >= r_inner - r_inner_stroke * 0.5:
                blend_pixel(x, y, c_gold[0], c_gold[1], c_gold[2], 1.0)
            elif dist < r_inner - r_inner_stroke * 0.5:
                # Center red fill
                blend_pixel(x, y, c_red[0], c_red[1], c_red[2], 1.0)

            # Center torch halo (circle r=10)
            if dist < 10.0 * scale:
                blend_pixel(x, y, c_gold[0], c_gold[1], c_gold[2], 0.35)

    # Pass 2: Draw Torch Flame & Pedestal
    # Torch flame: Triangle (50, 31) -> (54, 44) -> (46, 44)
    # Pedestal: Quad (48, 44) -> (52, 44) -> (51, 67) -> (49, 67)
    for py in range(int(30 * scale), int(68 * scale)):
        yf = py / scale
        for px in range(int(44 * scale), int(56 * scale)):
            xf = px / scale
            # Flame part
            if 31.0 <= yf <= 44.0:
                t = (yf - 31.0) / 13.0
                hw = t * 4.0
                if abs(xf - 50.0) <= hw:
                    blend_pixel(px, py, c_gold[0], c_gold[1], c_gold[2], 1.0)
            # Pedestal part
            if 44.0 < yf <= 67.0:
                t = (yf - 44.0) / 23.0
                hw = 2.0 - t * 1.0
                if abs(xf - 50.0) <= hw:
                    blend_pixel(px, py, c_white[0], c_white[1], c_white[2], 1.0)

    # Pass 3: Draw Bottom Ribbon Banner (30,76) to (70,76) to (66,84) to (34,84)
    for py in range(int(74 * scale), int(86 * scale)):
        yf = py / scale
        if 76.0 <= yf <= 84.0:
            t = (yf - 76.0) / 8.0
            left_x = 30.0 + t * 4.0
            right_x = 70.0 - t * 4.0
            for px in range(int(left_x * scale), int(right_x * scale)):
                # Gold banner with border
                border = (py == int(76 * scale) or py == int(84 * scale) or 
                          px == int(left_x * scale) or px == int(right_x * scale) - 1)
                if border:
                    blend_pixel(px, py, c_deepgold[0], c_deepgold[1], c_deepgold[2], 1.0)
                else:
                    blend_pixel(px, py, c_gold[0], c_gold[1], c_gold[2], 1.0)

    # Pass 4: Draw Bitmap Text for "MANIS JAYA" on banner
    def draw_text_pixel(text, start_x, start_y, char_w, char_h, color):
        curr_x = start_x
        for ch in text:
            pattern = FONT_5X7.get(ch, FONT_5X7[' '])
            for r, row_val in enumerate(pattern):
                for c in range(5):
                    if (row_val >> (4 - c)) & 1:
                        # Draw pixel block
                        bx = int((curr_x + c * (char_w / 5.0)) * scale)
                        by = int((start_y + r * (char_h / 7.0)) * scale)
                        bw = max(1, int((char_w / 5.0) * scale))
                        bh = max(1, int((char_h / 7.0) * scale))
                        for ox in range(bw):
                            for oy in range(bh):
                                blend_pixel(bx + ox, by + oy, color[0], color[1], color[2], 1.0)
            curr_x += char_w + 0.9

    # Draw "MANIS JAYA"
    draw_text_pixel("MANIS JAYA", 34.5, 77.2, 2.7, 5.6, c_navy)

    # Pass 5: Draw Curved "KARANG TARUNA" Text along upper arch (radius ~34)
    text_kt = "KARANG TARUNA"
    total_chars = len(text_kt)
    arch_radius = 34.5
    start_angle = -math.pi * 0.78
    end_angle = -math.pi * 0.22
    angle_step = (end_angle - start_angle) / (total_chars - 1)

    for i, ch in enumerate(text_kt):
        if ch == ' ':
            continue
        theta = start_angle + i * angle_step
        tx = 50.0 + arch_radius * math.cos(theta)
        ty = 50.0 + arch_radius * math.sin(theta)
        pattern = FONT_5X7.get(ch, FONT_5X7[' '])
        # Tangent angle for character rotation
        char_angle = theta + math.pi / 2.0
        cos_a = math.cos(char_angle)
        sin_a = math.sin(char_angle)

        cw = 2.4
        ch_h = 4.8
        for r, row_val in enumerate(pattern):
            for c in range(5):
                if (row_val >> (4 - c)) & 1:
                    local_x = (c - 2.0) * (cw / 5.0)
                    local_y = (r - 3.5) * (ch_h / 7.0)
                    rx = tx + (local_x * cos_a - local_y * sin_a)
                    ry = ty + (local_x * sin_a + local_y * cos_a)
                    px = int(rx * scale)
                    py = int(ry * scale)
                    for ox in range(2):
                        for oy in range(2):
                            blend_pixel(px + ox, py + oy, 255, 255, 255, 1.0)

    # Downsample from supersampling grid (ss x ss) to target size
    out_rows = []
    inv_ss2 = 1.0 / (ss * ss)
    for y in range(size):
        row = bytearray()
        for x in range(size):
            sum_r = 0.0
            sum_g = 0.0
            sum_b = 0.0
            sum_a = 0.0
            for sy in range(ss):
                for sx in range(ss):
                    idx = (y * ss + sy) * W + (x * ss + sx)
                    sum_r += buf_r[idx]
                    sum_g += buf_g[idx]
                    sum_b += buf_b[idx]
                    sum_a += buf_a[idx]
            avg_a = sum_a * inv_ss2
            if avg_a > 0.001:
                avg_r = int(min(255, max(0, (sum_r * inv_ss2))))
                avg_g = int(min(255, max(0, (sum_g * inv_ss2))))
                avg_b = int(min(255, max(0, (sum_b * inv_ss2))))
                avg_a_byte = int(min(255, max(0, avg_a * 255)))
                row.extend([avg_r, avg_g, avg_b, avg_a_byte])
            else:
                row.extend([0, 0, 0, 0])
        out_rows.append(row)

    return out_rows

def main():
    print("[*] Generating Official Karang Taruna Manis Jaya Logos & Icons...")
    os.makedirs("public/assets", exist_ok=True)

    # 1. Generate crisp SVG matching BrandLogo
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <circle cx="50" cy="50" r="47" fill="#1e3a8a" stroke="#facc15" stroke-width="2.5" />
  <circle cx="50" cy="50" r="39" fill="#1d4ed8" stroke="#facc15" stroke-width="1.8" stroke-dasharray="3,1" />
  <circle cx="50" cy="50" r="29" fill="#dc2626" stroke="#facc15" stroke-width="2" />
  <path d="M50 31 L54 44 L46 44 Z" fill="#facc15" />
  <path d="M48 44 L52 44 L51 67 L49 67 Z" fill="#f8fafc" />
  <circle cx="50" cy="50" r="10" fill="#facc15" opacity="0.35" />
  <path id="archLogo" d="M22,50 a28,28 0 1,1 56,0" fill="none" />
  <text font-size="7" fill="#ffffff" font-weight="bold" letter-spacing="0.8">
    <textPath href="#archLogo" startOffset="50%" text-anchor="middle">
      KARANG TARUNA
    </textPath>
  </text>
  <path d="M30 76 L70 76 L66 84 L34 84 Z" fill="#facc15" />
  <text x="50" y="82" font-size="5.5" fill="#1e3a8a" font-weight="bold" text-anchor="middle">
    MANIS JAYA
  </text>
</svg>'''

    with open("public/logo.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    with open("public/favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    print("[*] Rendering 512x512 Master Emblem PNG...")
    img_512 = render_logo_image(512)
    write_png("public/icon-512.png", 512, 512, img_512)
    write_png("public/assets/icon-512.png", 512, 512, img_512)
    write_png("public/assets/icon-maskable-512.png", 512, 512, img_512)
    write_png("public/logo.png", 512, 512, img_512)

    print("[*] Rendering 192x192 Master Emblem PNG...")
    img_192 = render_logo_image(192)
    write_png("public/icon-192.png", 192, 192, img_192)
    write_png("public/assets/icon-192.png", 192, 192, img_192)

    # 48x48 launcher icon for APK res/
    print("[*] Rendering 48x48 mipmap ic_launcher PNG...")
    img_48 = render_logo_image(48)
    write_png("public/ic_launcher_48.png", 48, 48, img_48)

    print("[+] All official Karang Taruna logo icons successfully generated!")

if __name__ == '__main__':
    main()
