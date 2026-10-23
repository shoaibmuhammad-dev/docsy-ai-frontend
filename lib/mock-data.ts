import { PdfDocument, Chat, Message, User } from './types';

export const initialUser: User = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
};

export const initialDocuments: PdfDocument[] = [
  {
    id: 'doc-1',
    title: 'Deep Learning & Transformer Survey 2025.pdf',
    status: 'ready',
    pageCount: 34,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'doc-2',
    title: 'Elena_Rostova_Staff_Product_Designer_Resume.pdf',
    status: 'ready',
    pageCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'doc-3',
    title: 'Residential_Lease_Agreement_Oakwood_Avenue.pdf',
    status: 'ready',
    pageCount: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
  {
    id: 'doc-4',
    title: 'Global_Supply_Chain_Operations_Manual_v3.pdf',
    status: 'failed',
    pageCount: 120,
    errorMessage: 'This PDF has 120 pages. The maximum is 100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
  },
];

export const initialChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Transformer Architecture & Attention Scaling',
    documentIds: ['doc-1'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'chat-2',
    title: 'Lease Terms & Maintenance Obligations',
    documentIds: ['doc-3'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const initialMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1-1',
      role: 'user',
      content: 'What are the core breakthroughs in linear attention mechanisms discussed in Section 3?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'msg-1-2',
      role: 'assistant',
      content: `Section 3 analyzes sub-quadratic attention variants aimed at reducing the traditional $\\mathcal{O}(N^2)$ memory bottleneck [1].

Key breakthroughs highlighted in the survey include:

- **State Space Model Hybrids**: Combining structured state matrices with selective gating mechanisms [1].
- **Hardware-Aware Chunking**: Computing block-diagonal approximations directly on SRAM to minimize HBM roundtrips [2].
- **Dynamic Decay Vectors**: Allowing decay constants to vary per-head rather than using a static positional bias [3].

Here is a performance comparison table from the benchmark benchmarks:

| Model Architecture | Context Window | Throughput (tok/s) | Perplexity (WikiText-103) |
| :--- | :--- | :--- | :--- |
| Standard Multi-Head Attention | 4,096 | 1,420 | 18.2 |
| FlashLinear SSM | 32,768 | 4,890 | 18.6 |
| Chunked Hybrid Kernel | 65,536 | 6,100 | 18.4 |

These innovations enable long-document inference on single-node GPU clusters with minimal perceptual loss in recall [1][2].`,
      citations: [
        { index: 1, docId: 'doc-1', chunkId: 'chk-101', page: 7 },
        { index: 2, docId: 'doc-1', chunkId: 'chk-102', page: 9 },
        { index: 3, docId: 'doc-1', chunkId: 'chk-103', page: 12 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
    },
    {
      id: 'msg-1-3',
      role: 'user',
      content: 'Does the paper address KV cache compression techniques for autoregressive inference?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'msg-1-4',
      role: 'assistant',
      content: `Yes, Section 4.2 specifically surveys **Key-Value Cache Compression** strategies [1].

The authors divide current techniques into two primary paradigms:

1. **Token Eviction Policies**: Discarding uninformative tokens dynamically based on cumulative attention scores [1].
2. **Quantization & Sparsification**: Quantizing keys and values to 4-bit integer representations while preserving full precision for attention sinks [2].

> "Quantized KV caches achieve up to 73% memory reduction with negligible degradation (<0.1 perplexity change) across needle-in-a-haystack retrieval tasks up to 128k tokens." [2]`,
      citations: [
        { index: 1, docId: 'doc-1', chunkId: 'chk-104', page: 16 },
        { index: 2, docId: 'doc-1', chunkId: 'chk-105', page: 18 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
    },
    {
      id: 'msg-1-5',
      role: 'user',
      content: 'What training hardware and dataset scales were evaluated in the benchmark experiments?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    },
    {
      id: 'msg-1-6',
      role: 'assistant',
      content: `The empirical evaluation in Section 6 was conducted across **128 NVIDIA H100 80GB SXM5 nodes** connected via 3.2 Tbps InfiniBand [1].

Training details include:
- **Corpus**: 1.2 Trillion tokens curated from multi-lingual and scientific publications [1].
- **Optimizer**: AdamW with warmup of 2,000 steps and cosine annealing decay [2].
- **Precision**: Mixed FP8 computing using custom tensor cores [1][2].`,
      citations: [
        { index: 1, docId: 'doc-1', chunkId: 'chk-106', page: 24 },
        { index: 2, docId: 'doc-1', chunkId: 'chk-107', page: 26 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
  'chat-2': [
    {
      id: 'msg-2-1',
      role: 'user',
      content: 'What is the required notice period for vacating the premises according to the agreement?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    },
    {
      id: 'msg-2-2',
      role: 'assistant',
      content: `Under **Section 4 (Term and Termination)**, the tenant is required to provide a minimum of **60 days written notice** prior to the lease expiration date [1].

Notice must be delivered via certified postal mail or acknowledged electronic mail to the designated landlord agent [1]. Failure to deliver proper notice results in automatic rollover into a month-to-month tenancy at a 10% premium [2].`,
      citations: [
        { index: 1, docId: 'doc-3', chunkId: 'chk-201', page: 3 },
        { index: 2, docId: 'doc-3', chunkId: 'chk-202', page: 4 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 39).toISOString(),
    },
    {
      id: 'msg-2-3',
      role: 'user',
      content: 'Who is responsible for heating and HVAC equipment repairs?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: 'msg-2-4',
      role: 'assistant',
      content: `According to **Section 9 (Maintenance & Repairs)**:

- **Landlord Responsibility**: Major structural repairs, central HVAC systems, and natural gas heating boilers are the landlord's duty, provided damage is not caused by tenant negligence [1].
- **Tenant Obligation**: The tenant must replace furnace air filters every 90 days and report any abnormal noises or refrigerant leaks within 48 hours [2].

Routine filter replacements are deemed regular tenant upkeep [2].`,
      citations: [
        { index: 1, docId: 'doc-3', chunkId: 'chk-203', page: 7 },
        { index: 2, docId: 'doc-3', chunkId: 'chk-204', page: 8 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    },
    {
      id: 'msg-2-5',
      role: 'user',
      content: 'Can you summarize the security deposit return terms and allowable deductions?',
      citations: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: 'msg-2-6',
      role: 'assistant',
      content: `The security deposit disposition is governed by **Section 6 (Security Deposit)** [1]:

- **Return Window**: The landlord must return the remaining deposit within **21 calendar days** of key handover [1].
- **Itemized Statement**: Any deductions must be accompanied by an itemized written statement with contractor receipts [1].

**Allowable Deductions:**
- Unpaid rent or utility charges [1].
- Remediation of physical damages exceeding normal wear and tear [2].
- Professional carpet cleaning if pet stains or smoke residues are detected [2].`,
      citations: [
        { index: 1, docId: 'doc-3', chunkId: 'chk-205', page: 5 },
        { index: 2, docId: 'doc-3', chunkId: 'chk-206', page: 6 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
};
