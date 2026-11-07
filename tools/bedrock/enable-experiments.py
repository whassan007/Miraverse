#!/usr/bin/env python3
"""Turns on the beta-API experiment in a test world's level.dat. Test servers only.

Scripted test players need the experiment. Player worlds and shipped packs never use this.
"""
import struct
import sys

END, BYTE, SHORT, INT, LONG, FLOAT, DOUBLE, BYTES, STRING, LIST, COMPOUND, INTS, LONGS = range(13)
SIZES = {BYTE: 1, SHORT: 2, INT: 4, LONG: 8, FLOAT: 4, DOUBLE: 8}


def skip_payload(data, pos, tag):
    if tag in SIZES:
        return pos + SIZES[tag]
    if tag == BYTES:
        return pos + 4 + struct.unpack_from('<i', data, pos)[0]
    if tag == STRING:
        return pos + 2 + struct.unpack_from('<H', data, pos)[0]
    if tag == LIST:
        inner = data[pos]
        count = struct.unpack_from('<i', data, pos + 1)[0]
        pos += 5
        for _ in range(count):
            pos = skip_payload(data, pos, inner)
        return pos
    if tag == COMPOUND:
        while data[pos] != END:
            tag_inner = data[pos]
            name_len = struct.unpack_from('<H', data, pos + 1)[0]
            pos = skip_payload(data, pos + 3 + name_len, tag_inner)
        return pos + 1
    if tag == INTS:
        return pos + 4 + 4 * struct.unpack_from('<i', data, pos)[0]
    if tag == LONGS:
        return pos + 4 + 8 * struct.unpack_from('<i', data, pos)[0]
    raise ValueError(f'unknown tag {tag}')


def named(tag, name, payload):
    encoded = name.encode()
    return bytes([tag]) + struct.pack('<H', len(encoded)) + encoded + payload


def main(path):
    raw = open(path, 'rb').read()
    version = raw[:4]
    body = bytearray(raw[8:])
    pos = 3 + struct.unpack_from('<H', body, 1)[0]
    # Find the top-level "experiments" compound and replace it.
    while body[pos] != END:
        start = pos
        tag = body[pos]
        name_len = struct.unpack_from('<H', body, pos + 1)[0]
        name = bytes(body[pos + 3 : pos + 3 + name_len]).decode()
        end = skip_payload(body, pos + 3 + name_len, tag)
        if name == 'experiments':
            del body[start:end]
            pos = start
            continue
        pos = end
    flags = b''.join(named(BYTE, key, b'\x01') for key in ('experiments_ever_used', 'gametest', 'saved_with_toggled_experiments'))
    body[pos:pos] = named(COMPOUND, 'experiments', flags + bytes([END]))
    with open(path, 'wb') as out:
        out.write(version + struct.pack('<I', len(body)) + bytes(body))
    print('experiments enabled')


main(sys.argv[1])
