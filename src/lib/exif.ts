import type { Coordinates } from '../types';

function readAscii(view: DataView, start: number, length: number) {
  let result = '';
  for (let index = 0; index < length; index += 1) {
    result += String.fromCharCode(view.getUint8(start + index));
  }
  return result;
}

function readUint16(view: DataView, offset: number, littleEndian: boolean) {
  return view.getUint16(offset, littleEndian);
}

function readUint32(view: DataView, offset: number, littleEndian: boolean) {
  return view.getUint32(offset, littleEndian);
}

function readRational(view: DataView, offset: number, littleEndian: boolean) {
  const numerator = readUint32(view, offset, littleEndian);
  const denominator = readUint32(view, offset + 4, littleEndian);
  if (!denominator) return 0;
  return numerator / denominator;
}

function convertDmsToDecimal(
  values: [number, number, number],
  reference: string | null,
) {
  const [degrees, minutes, seconds] = values;
  const absolute = degrees + minutes / 60 + seconds / 3600;

  if (reference === 'S' || reference === 'W') {
    return -absolute;
  }

  return absolute;
}

function findExifSegment(view: DataView) {
  if (view.getUint16(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;

  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      break;
    }

    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);

    if (marker === 0xe1 && readAscii(view, offset + 4, 4) === 'Exif') {
      return offset + 10;
    }

    if (length < 2) {
      break;
    }

    offset += 2 + length;
  }

  return null;
}

function parseGpsCoordinates(view: DataView, tiffStart: number) {
  const byteOrder = readAscii(view, tiffStart, 2);
  const littleEndian = byteOrder === 'II';
  const firstIfdOffset = readUint32(view, tiffStart + 4, littleEndian);
  const firstIfdPointer = tiffStart + firstIfdOffset;
  const entryCount = readUint16(view, firstIfdPointer, littleEndian);
  let gpsIfdOffset = 0;

  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = firstIfdPointer + 2 + index * 12;
    const tag = readUint16(view, entryOffset, littleEndian);

    if (tag === 0x8825) {
      gpsIfdOffset = readUint32(view, entryOffset + 8, littleEndian);
      break;
    }
  }

  if (!gpsIfdOffset) {
    return null;
  }

  const gpsPointer = tiffStart + gpsIfdOffset;
  const gpsEntryCount = readUint16(view, gpsPointer, littleEndian);
  let latitudeRef: string | null = null;
  let longitudeRef: string | null = null;
  let latitude: [number, number, number] | null = null;
  let longitude: [number, number, number] | null = null;

  for (let index = 0; index < gpsEntryCount; index += 1) {
    const entryOffset = gpsPointer + 2 + index * 12;
    const tag = readUint16(view, entryOffset, littleEndian);
    const type = readUint16(view, entryOffset + 2, littleEndian);
    const count = readUint32(view, entryOffset + 4, littleEndian);
    const valueOffset = readUint32(view, entryOffset + 8, littleEndian);

    if (tag === 0x0001 && type === 2 && count > 0) {
      latitudeRef = readAscii(view, entryOffset + 8, 1);
    }

    if (tag === 0x0003 && type === 2 && count > 0) {
      longitudeRef = readAscii(view, entryOffset + 8, 1);
    }

    if (tag === 0x0002 && type === 5 && count === 3) {
      const rationalOffset = tiffStart + valueOffset;
      latitude = [
        readRational(view, rationalOffset, littleEndian),
        readRational(view, rationalOffset + 8, littleEndian),
        readRational(view, rationalOffset + 16, littleEndian),
      ];
    }

    if (tag === 0x0004 && type === 5 && count === 3) {
      const rationalOffset = tiffStart + valueOffset;
      longitude = [
        readRational(view, rationalOffset, littleEndian),
        readRational(view, rationalOffset + 8, littleEndian),
        readRational(view, rationalOffset + 16, littleEndian),
      ];
    }
  }

  if (!latitude || !longitude) {
    return null;
  }

  return {
    lat: convertDmsToDecimal(latitude, latitudeRef),
    lng: convertDmsToDecimal(longitude, longitudeRef),
  };
}

export async function extractImageGps(file: File): Promise<Coordinates | null> {
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return null;
  }

  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const tiffStart = findExifSegment(view);

  if (tiffStart == null) {
    return null;
  }

  try {
    return parseGpsCoordinates(view, tiffStart);
  } catch {
    return null;
  }
}

export function distanceInMeters(a: Coordinates, b: Coordinates) {
  const earthRadius = 6371000;
  const latDelta = ((b.lat - a.lat) * Math.PI) / 180;
  const lngDelta = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
