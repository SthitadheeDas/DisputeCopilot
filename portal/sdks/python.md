# Python SDK (/sdks/python)

[Download SDK](/__downloads/sdk/python.zip)

## Intro [#intro]

The Dispute Copilot API SDK provides access to the Dispute Copilot API REST APIs.

REST API for **Dispute Copilot**, an autonomous merchant defense assistant built for the PayPal AI Hackathon.
It correlates active PayPal payment disputes with store order fulfillment records, calculates deterministic
winnability scores (0–100), synthesizes grounded Evidence Packs, and generates defense response drafts using Gemini AI.

## Installation [#installation]

Add the SDK to your project from its folder, with whichever package manager your project uses. Give each tool a path containing a slash, such as `../dispute-copilot-api` — a bare folder name is looked up on PyPI instead, and resolves to whatever project holds that name there:

```bash
pip install <path-to-sdk>
```

```bash
uv add <path-to-sdk>
```

```bash
poetry add <path-to-sdk>
```

## Quick Start [#quick-start]

### Synchronous client [#synchronous-client]

Construct `DisputeCopilotApiClient` with keyword arguments, and call `close()` when you are done. Every argument is optional.

```python
from dispute_copilot_api import DisputeCopilotApiClient

client = DisputeCopilotApiClient(environment="production")

client.close()
```

Alternatively, scope it — `with DisputeCopilotApiClient(...) as client:` closes the pool on exit.

### Asynchronous client [#asynchronous-client]

`AsyncDisputeCopilotApiClient` mirrors `DisputeCopilotApiClient` with **identical method names**, and every endpoint method is a coroutine. It takes the same arguments, with some differences — for example, the transport argument is `custom_async_http_client`.

```python
from asyncio import run

from dispute_copilot_api import AsyncDisputeCopilotApiClient

async def main() -> None:
    client = AsyncDisputeCopilotApiClient(environment="production")
    await client.aclose()

run(main())
```

Alternatively, scope it — `async with AsyncDisputeCopilotApiClient(...) as client:` closes the pool on exit.