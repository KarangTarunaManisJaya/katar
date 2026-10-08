#!/usr/bin/env python3
"""
Convert official Karang Taruna logo (/app/applet/logo-karang-taruna.png)
into all required web, PWA, Favicon, SVG, and Android asset formats.
"""
import os
import zlib
import struct
import base64

def read_png_rgba(filename):
    with open(filename, 'rb') as f:
        data = f.read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    w, h, depth, colortype = struct.unpack('>IIBB', data[16:26])
    assert depth == 8 and colortype == 6, f'Expected 8-bit RGBA, got {depth}, {colortype}'
    
    idat = []
    pos = 8
    while pos < len(data):
        l, = struct.unpack('>I', data[pos:pos+4])
        t = data[pos+4:pos+8]
        if t == b'IDAT': idat.append(data[pos+8:pos+8+l])
        pos += 12 + l
    
    raw = zlib.decompress(b''.join(idat))
    stride = 1 + w * 4
    unfiltered = bytearray(w * h * 4)
    bpp = 4
    
    def paeth(a, b, c):
        p = a + b - c
        pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
        if pa <= pb and pa <= pc: return a
        if pb <= pc: return b
        return c

    prev_row = bytearray(w * 4)
    for y in range(h):
        filter_type = raw[y * stride]
        curr_row = raw[y * stride + 1 : (y + 1) * stride]
        recon_row = bytearray(w * 4)
        for x in range(w * 4):
            filt_val = curr_row[x]
            recon_left = recon_row[x - bpp] if x >= bpp else 0
            recon_above = prev_row[x]
            recon_above_left = prev_row[x - bpp] if x >= bpp else 0
            
            if filter_type == 0: val = filt_val
            elif filter_type == 1: val = (filt_val + recon_left) & 0xff
            elif filter_type == 2: val = (filt_val + recon_above) & 0xff
            elif filter_type == 3: val = (filt_val + (recon_left + recon_above) // 2) & 0xff
            elif filter_type == 4: val = (filt_val + paeth(recon_left, recon_above, recon_above_left)) & 0xff
            else: val = filt_val
            recon_row[x] = val
        unfiltered[y * w * 4 : (y + 1) * w * 4] = recon_row
        prev_row = recon_row
        
    return w, h, bytes(unfiltered)

def resize_rgba_fast(src_w, src_h, src_bytes, dst_w, dst_h):
    dst = bytearray(dst_w * dst_h * 4)
    x_scale = (src_w - 1) / max(1, dst_w - 1)
    y_scale = (src_h - 1) / max(1, dst_h - 1)
    
    for dy in range(dst_h):
        sy = dy * y_scale
        iy = int(sy)
        fy = sy - iy
        iy1 = min(iy + 1, src_h - 1)
        
        row0_off = iy * src_w * 4
        row1_off = iy1 * src_w * 4
        dst_row_off = dy * dst_w * 4
        
        for dx in range(dst_w):
            sx = dx * x_scale
            ix = int(sx)
            fx = sx - ix
            ix1 = min(ix + 1, src_w - 1)
            
            p00 = row0_off + ix * 4
            p10 = row0_off + ix1 * 4
            p01 = row1_off + ix * 4
            p11 = row1_off + ix1 * 4
            
            w00 = (1 - fx) * (1 - fy)
            w10 = fx * (1 - fy)
            w01 = (1 - fx) * fy
            w11 = fx * fy
            
            dp = dst_row_off + dx * 4
            for c in range(4):
                val = int(
                    src_bytes[p00 + c] * w00 +
                    src_bytes[p10 + c] * w10 +
                    src_bytes[p01 + c] * w01 +
                    src_bytes[p11 + c] * w11 + 0.5
                )
                dst[dp + c] = min(255, max(0, val))
                
    return bytes(dst)

def make_png(w, h, rgba_bytes):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw.extend(rgba_bytes[y*w*4:(y+1)*w*4])
    idat = chunk(b'IDAT', zlib.compress(bytes(raw), 6))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def build_ico(png_data_list):
    count = len(png_data_list)
    header = struct.pack('<HHH', 0, 1, count)
    offset = 6 + count * 16
    dir_entries = []
    data_blobs = []
    for w, h, data in png_data_list:
        size = len(data)
        dw = 0 if w >= 256 else w
        dh = 0 if h >= 256 else h
        entry = struct.pack('<BBBBHHII', dw, dh, 0, 0, 1, 32, size, offset)
        dir_entries.append(entry)
        data_blobs.append(data)
        offset += size
    return header + b''.join(dir_entries) + b''.join(data_blobs)

def main():
    src_file = '/app/applet/logo-karang-taruna.png'
    if not os.path.exists(src_file):
        print(f"Error: {src_file} does not exist!")
        return

    print("[*] Reading source official logo...")
    w, h, src_pixels = read_png_rgba(src_file)
    print(f"[+] Loaded {w}x{h} source image.")

    # Target files to write
    os.makedirs('public', exist_ok=True)
    os.makedirs('public/assets', exist_ok=True)
    os.makedirs('src/assets/images', exist_ok=True)

    # 1. High-resolution 512x512
    print("[*] Generating 512x512 icons...")
    p512 = resize_rgba_fast(w, h, src_pixels, 512, 512)
    png512 = make_png(512, 512, p512)
    for p in ['public/logo.png', 'public/icon-512.png', 'public/assets/icon-512.png', 'public/assets/icon-maskable-512.png']:
        with open(p, 'wb') as f:
            f.write(png512)
        print(f"  -> Written {p}")

    # Copy full source image to src/assets/images and public
    with open('src/assets/images/logo-karang-taruna.png', 'wb') as f:
        with open(src_file, 'rb') as sf:
            f.write(sf.read())
    with open('public/logo-karang-taruna.png', 'wb') as f:
        with open(src_file, 'rb') as sf:
            f.write(sf.read())
    print("  -> Copied full res logo-karang-taruna.png to src/assets/images and public")

    # 2. 192x192
    print("[*] Generating 192x192 icons...")
    p192 = resize_rgba_fast(w, h, src_pixels, 192, 192)
    png192 = make_png(192, 192, p192)
    for p in ['public/icon-192.png', 'public/assets/icon-192.png']:
        with open(p, 'wb') as f:
            f.write(png192)
        print(f"  -> Written {p}")

    # 3. 48x48
    print("[*] Generating 48x48 launcher icon...")
    p48 = resize_rgba_fast(w, h, src_pixels, 48, 48)
    png48 = make_png(48, 48, p48)
    with open('public/ic_launcher_48.png', 'wb') as f:
        f.write(png48)
    print("  -> Written public/ic_launcher_48.png")

    # 4. 32x32 & 16x16 for favicon.ico
    print("[*] Generating multi-size favicon.ico...")
    p32 = resize_rgba_fast(w, h, src_pixels, 32, 32)
    png32 = make_png(32, 32, p32)
    p16 = resize_rgba_fast(w, h, src_pixels, 16, 16)
    png16 = make_png(16, 16, p16)
    ico_bytes = build_ico([
        (64, 64, make_png(64, 64, resize_rgba_fast(w, h, src_pixels, 64, 64))),
        (48, 48, png48),
        (32, 32, png32),
        (16, 16, png16)
    ])
    with open('public/favicon.ico', 'wb') as f:
        f.write(ico_bytes)
    print("  -> Written public/favicon.ico")

    # 5. SVGs embedding high-res data URL
    print("[*] Generating SVGs (public/logo.svg and public/favicon.svg)...")
    # Base64 encoded 512x512
    b64_512 = base64.b64encode(png512).decode('ascii')
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="circleClip">
      <circle cx="256" cy="256" r="256"/>
    </clipPath>
  </defs>
  <image href="data:image/png;base64,{b64_512}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>'''
    with open('public/logo.svg', 'w') as f:
        f.write(svg_content)
    with open('public/favicon.svg', 'w') as f:
        f.write(svg_content)
    print("  -> Written public/logo.svg and public/favicon.svg")

    print("[SUCCESS] All official logo assets generated!")

if __name__ == '__main__':
    main()
