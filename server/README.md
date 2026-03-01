# Fontrapunkt Server

Optional server for generating static font instances from variable fonts.

## Setup

1. Install Python dependencies:
```bash
pip install fonttools
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create temp directory:
```bash
mkdir temp
```

## Running

```bash
npm start
```

Server runs on port 3001 by default (set PORT environment variable to change).

## API

### POST /api/generate-instance

Generate a static font instance from a variable font.

**Request:**
- Content-Type: `multipart/form-data`
- `font`: Font file (TTF, OTF, WOFF, WOFF2)
- `axisValues`: JSON object with axis values (e.g., `{"wght": 400, "wdth": 100}`)
- `outputFormat`: Output format (`ttf` or `otf`)

**Response:**
- Content-Type: `font/ttf` or `font/otf`
- Body: Binary font file

**Rate Limit:** 10 requests per minute per IP

**Security:**
- Files are automatically deleted after processing
- 30 second timeout
- 50MB file size limit
- Input validation for font file types

