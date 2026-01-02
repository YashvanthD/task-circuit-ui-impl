import * as apiTasks from './apis/api_tasks';
import { createResourceUtil } from './resourceUtil';

const tasksResource = createResourceUtil({
  listFn: apiTasks.listTasks,
  getFn: apiTasks.getTask,
  addFn: apiTasks.createTask,
  updateFn: apiTasks.updateTask,
  deleteFn: apiTasks.deleteTask,
}, {
  cacheKey: 'tasks',
  idField: 'task_id',
  normalizeList: d => Array.isArray(d) ? d : (d && d.tasks ? d.tasks : []),
});

export const taskEvents = tasksResource.events;
export default tasksResource;

