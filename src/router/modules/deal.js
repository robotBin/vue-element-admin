/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dealRouter = {
  path: '/deal',
  component: Layout,
  redirect: '/deal/complex-table',
  name: 'DealManage',
  meta: {
    title: 'DealManageMent',
    icon: 'table'
  },
  children: [
    /*
    {
      path: 'dynamic-table',
      component: () => import('@/views/table/dynamic-table/index'),
      name: 'DynamicTable',
      meta: { title: 'dynamicTable' }
    },
    {
      path: 'drag-table',
      component: () => import('@/views/table/drag-table'),
      name: 'DragTable',
      meta: { title: 'dragTable' }
    },
    {
      path: 'inline-edit-table',
      component: () => import('@/views/table/inline-edit-table'),
      name: 'InlineEditTable',
      meta: { title: 'inlineEditTable' }
    },*/
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table'),
      name: 'ComplexTable',
      meta: { title: 'DealManageMent' }
    }
  ]
}
export default dealRouter
