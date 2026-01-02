import fieldsDef from './fields';

const fields = fieldsDef.fields || fieldsDef;

function defaultForType(t, def) {
  if (def && def.default !== undefined) return def.default;
  switch (t) {
    case 'string':
      return '';
    case 'number':
    case 'currency':
      return 0;
    case 'date':
      return null;
    case 'boolean':
      return false;
    case 'list':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

function buildSkeletonForResource(resource) {
  const defs = fields[resource] || [];
  const out = {};
  for (const f of defs) {
    out[f.key] = defaultForType(f.type, f);
  }
  return out;
}

const generated = {};
for (const resource of Object.keys(fields)) {
  generated[resource] = buildSkeletonForResource(resource);
}

export function getSkeleton(resource) {
  return generated[resource] ? { ...generated[resource] } : {};
}

// export common skeletons
export const userType = getSkeleton('user');
export const pondType = getSkeleton('pond');
export const fishType = getSkeleton('fish');
export const samplingType = getSkeleton('sampling');
export const taskType = getSkeleton('task');

export default { getSkeleton, userType, pondType, fishType, samplingType, taskType };

