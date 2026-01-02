import * as apiFish from './apis/api_fish';
import { createResourceUtil } from './resourceUtil';

const fishResource = createResourceUtil({
  listFn: apiFish.listFish,
  getFn: apiFish.getFish,
  addFn: apiFish.addFish,
  updateFn: apiFish.updateFish,
  deleteFn: apiFish.deleteFish,
}, {
  cacheKey: 'fish',
  idField: 'fish_id',
  normalizeList: d => Array.isArray(d) ? d : (d && d.fish ? d.fish : []),
});

export const fishEvents = fishResource.events;
export default fishResource;

