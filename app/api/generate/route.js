import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, max_tokens = 300 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate pitch' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
Commit.

---

**File 8 (the big one):** Name it `app/page.js`

This file is too long to paste here in the chat. Download it directly:
- [app/page.js](computer:///mnt/user-data/outputs/pitch-builder-project/app/page.js)

Open that file, copy ALL the contents, paste into GitHub.

---

## Step 3: Verify your structure

When done, your repo should look like this at the root:
```
pitch-builder/
├── app/
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

And inside `app/`:
```
app/
├── api/
│   └── generate/
│       └── route.js
├── globals.css
├── layout.js
└── page.js
