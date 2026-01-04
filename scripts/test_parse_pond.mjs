import { parsePondList } from '../src/utils/parsePond.js';


const sample = {
  "data": {
    "ponds": [
      {
        "accountKey": "926203",
        "createdAt": "2026-01-02T23:51:00",
        "currentStock": [
          {
            "averageWeight": 1,
            "batchId": null,
            "expectedHarvestDate": null,
            "id": null,
            "pondId": null,
            "quantity": 105,
            "source": null,
            "species": "CF001",
            "stockId": "SAMP-20260102235100-2559",
            "stockingDate": "2026-01-02T23:51:00"
          }
        ],
        "dimensions": {},
        "farmName": "A",
        "fishCount": 210,
        "id": "926203-001",
        "lastMaintenance": null,
        "location": {},
        "name": null,
        "photos": [],
        "pondId": "926203-001",
        "status": null,
        "type": null,
        "volume": null,
        "waterQuality": []
      }
    ]
  },
  "success": true,
  "timestamp": "2026-01-03T00:01:31.051232+05:30"
};

(async () => {
  try {
    const parsed = parsePondList(sample);
    console.log('parsed length:', Array.isArray(parsed) ? parsed.length : 'not array');
    console.log(JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.error('parser error', e);
  }
})();

