# Live Edit Plugin for Kosmotheon

A development tool that makes all content editable and auto-saves when running locally on localhost.

## Features

- **Localhost Only**: Only activates when running on localhost (127.0.0.1, localhost, etc.)
- **Live Editing**: Click any text content to edit it directly in the browser
- **Auto-Save**: Changes are automatically saved after 2 seconds of inactivity
- **Visual Feedback**: Clear indicators show when live edit is active
- **Keyboard Shortcuts**: Ctrl/Cmd+S to save all changes, Escape to exit edit mode
- **File Path Display**: Shows which markdown file is being edited
- **Server Integration**: Saves changes back to actual markdown files

## Quick Start

### Option 1: Use the Development Script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x start_dev.sh

# Start both servers
./start_dev.sh
```

This will start:
- MkDocs server on http://127.0.0.1:8001
- Live Edit server on http://127.0.0.1:8002

### Option 2: Manual Setup

1. **Start the Live Edit Server**:
   ```bash
   python3 live_edit_server.py 8002
   ```

2. **Start MkDocs Server** (in another terminal):
   ```bash
   mkdocs serve --dev-addr=127.0.0.1:8001
   ```

3. **Open your browser** to http://127.0.0.1:8001

## How to Use

### Visual Indicators

When live edit is active, you'll see:

1. **Green "LIVE EDIT" indicator** in the top-right corner
2. **File path display** showing which markdown file you're editing
3. **Blue "Save All" button** in the bottom-right corner
4. **Dashed outlines** around editable content

### Editing Content

1. **Click any text** on the page to start editing
2. **Type your changes** directly in the browser
3. **Changes auto-save** after 2 seconds of inactivity
4. **Use Ctrl/Cmd+S** to manually save all changes
5. **Press Escape** to exit edit mode

### What Gets Edited

The plugin makes these elements editable:
- Headers (H1-H6)
- Paragraphs
- List items
- Blockquotes
- Admonition titles and content

### Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save all changes
- **Ctrl/Cmd + Z**: Undo (in editable elements)
- **Escape**: Exit edit mode

## Technical Details

### How It Works

1. **Client-Side**: JavaScript plugin detects localhost and makes content editable
2. **Server-Side**: Python server receives changes and saves them to markdown files
3. **HTML-to-Markdown**: Server converts edited HTML back to markdown format
4. **Auto-Save**: Changes are saved automatically and manually

### File Structure

```
Kosmotheon/
├── docs/javascripts/live-edit.js    # Client-side plugin
├── live_edit_server.py              # Server-side handler
├── start_dev.sh                     # Development startup script
└── LIVE_EDIT_README.md              # This file
```

### Server Endpoints

- **POST /save**: Receives content changes and saves to markdown files
- **OPTIONS /save**: Handles CORS preflight requests

### Security

- Only works on localhost (127.0.0.1, localhost, etc.)
- Validates file paths to prevent directory traversal
- Only allows editing of existing markdown files in the docs/ directory

## Troubleshooting

### Live Edit Not Appearing

1. **Check URL**: Must be on localhost (127.0.0.1:8001, not 0.0.0.0:8001)
2. **Check Console**: Look for "Live Edit Plugin: Active on localhost" message
3. **Check Ports**: Ensure both servers are running (8001 and 8002)

### Save Errors

1. **Check Live Edit Server**: Ensure it's running on port 8002
2. **Check File Permissions**: Ensure markdown files are writable
3. **Check Console**: Look for error messages in browser console

### Content Not Saving

1. **Check Network Tab**: Look for failed requests to localhost:8002
2. **Check Server Logs**: Look for errors in the live edit server terminal
3. **Fallback**: Changes are saved to localStorage as backup

## Development

### Customizing the Plugin

Edit `docs/javascripts/live-edit.js` to:
- Change auto-save timing
- Add new editable elements
- Modify visual indicators
- Add new keyboard shortcuts

### Extending the Server

Edit `live_edit_server.py` to:
- Add more robust HTML-to-markdown conversion
- Add authentication
- Add change logging
- Add backup functionality

### Adding New Features

1. **Client-Side**: Add JavaScript functionality in `live-edit.js`
2. **Server-Side**: Add Python endpoints in `live_edit_server.py`
3. **Integration**: Update both to work together

## Limitations

- **HTML-to-Markdown**: Current conversion is basic; complex formatting may not convert perfectly
- **Element Mapping**: Relies on CSS selectors to find editable elements
- **File Locking**: No protection against simultaneous edits
- **Backup**: Only localStorage backup; no server-side backup

## Future Enhancements

- [ ] Better HTML-to-markdown conversion
- [ ] Real-time collaboration
- [ ] Change history and undo
- [ ] Image upload support
- [ ] Syntax highlighting for code blocks
- [ ] Markdown preview mode
- [ ] Conflict resolution for simultaneous edits

## Contributing

To contribute to the live edit feature:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on localhost
5. Submit a pull request

## License

This live edit plugin is part of the Kosmotheon project and follows the same license terms. 