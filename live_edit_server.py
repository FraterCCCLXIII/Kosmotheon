#!/usr/bin/env python3
"""
Live Edit Server for Kosmotheon
Handles saving live edit changes back to markdown files
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import re
from datetime import datetime

class LiveEditHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for health check"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'message': 'Live Edit Server is running',
                'timestamp': datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404, "Not found")
    
    def do_POST(self):
        """Handle POST requests for saving content"""
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            # Extract data
            file_path = data.get('filePath', '')
            element_id = data.get('elementId', '')
            content = data.get('content', '')
            
            # Validate file path
            if not file_path or '..' in file_path:
                self.send_error(400, "Invalid file path")
                return
            
            # Construct full file path
            full_path = os.path.join('docs', file_path)
            
            # Check if file exists
            if not os.path.exists(full_path):
                self.send_error(404, "File not found")
                return
            
            # Convert HTML to markdown
            markdown_content = self.html_to_markdown(content, element_id, full_path)
            
            # Only save if content is substantial
            if len(markdown_content.strip()) > 10:
                # Read current file content
                with open(full_path, 'r', encoding='utf-8') as f:
                    current_content = f.read()
                
                # For now, we'll replace the entire content with the edited element
                # This is a simplified approach - in a more sophisticated version,
                # we would parse the markdown and only update the specific element
                new_content = markdown_content
                
                # Write the new content
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ Saved changes to {file_path}")
                print(f"   Content length: {len(markdown_content)} characters")
                print(f"   Content preview: {markdown_content[:100]}...")
            else:
                print(f"⚠️  Skipped saving - content too short: {len(markdown_content)} characters")
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'success',
                'message': 'Content saved successfully',
                'file': file_path,
                'content_length': len(markdown_content)
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"❌ Error saving content: {str(e)}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def html_to_markdown(self, html_content, element_id, original_markdown):
        """
        Convert HTML content back to markdown format
        This is a more conservative version that preserves content better
        """
        # If the content is very short, it might be a partial edit
        # In that case, we should be more careful about conversion
        if len(html_content.strip()) < 100:
            # For small edits, try to preserve the original structure
            # Just clean up basic HTML tags
            markdown_content = html_content
            
            # Convert only the most basic HTML elements
            markdown_content = re.sub(r'<strong>(.*?)</strong>', r'**\1**', markdown_content)
            markdown_content = re.sub(r'<em>(.*?)</em>', r'*\1*', markdown_content)
            markdown_content = re.sub(r'<code>(.*?)</code>', r'`\1`', markdown_content)
            markdown_content = re.sub(r'<a href="([^"]*)">(.*?)</a>', r'[\2](\1)', markdown_content)
            
            # Remove any remaining HTML tags
            markdown_content = re.sub(r'<[^>]+>', '', markdown_content)
            
            return markdown_content
        else:
            # For larger content, we need to be more careful
            # Let's try to preserve the original markdown structure
            markdown_content = html_content
            
            # Convert HTML elements to markdown
            markdown_content = re.sub(r'<h1>(.*?)</h1>', r'# \1', markdown_content)
            markdown_content = re.sub(r'<h2>(.*?)</h2>', r'## \1', markdown_content)
            markdown_content = re.sub(r'<h3>(.*?)</h3>', r'### \1', markdown_content)
            markdown_content = re.sub(r'<h4>(.*?)</h4>', r'#### \1', markdown_content)
            markdown_content = re.sub(r'<h5>(.*?)</h5>', r'##### \1', markdown_content)
            markdown_content = re.sub(r'<h6>(.*?)</h6>', r'###### \1', markdown_content)
            
            markdown_content = re.sub(r'<p>(.*?)</p>', r'\1\n\n', markdown_content)
            markdown_content = re.sub(r'<br\s*/?>', r'\n', markdown_content)
            
            markdown_content = re.sub(r'<strong>(.*?)</strong>', r'**\1**', markdown_content)
            markdown_content = re.sub(r'<em>(.*?)</em>', r'*\1*', markdown_content)
            markdown_content = re.sub(r'<code>(.*?)</code>', r'`\1`', markdown_content)
            
            # Handle links
            markdown_content = re.sub(r'<a href="([^"]*)">(.*?)</a>', r'[\2](\1)', markdown_content)
            
            # Handle lists
            markdown_content = re.sub(r'<ul>(.*?)</ul>', r'\1', markdown_content, flags=re.DOTALL)
            markdown_content = re.sub(r'<ol>(.*?)</ol>', r'\1', markdown_content, flags=re.DOTALL)
            markdown_content = re.sub(r'<li>(.*?)</li>', r'- \1', markdown_content)
            
            # Remove any remaining HTML tags
            markdown_content = re.sub(r'<[^>]+>', '', markdown_content)
            
            # Clean up extra whitespace
            markdown_content = re.sub(r'\n\s*\n\s*\n', r'\n\n', markdown_content)
            markdown_content = markdown_content.strip()
            
            return markdown_content

def run_server(port=8002):
    """Run the live edit server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, LiveEditHandler)
    print(f"Live Edit Server running on port {port}")
    print(f"Access the server at: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    port = 8002
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 8002")
    
    run_server(port) 