import { processPageQueries } from "../query"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"

export async function runPageQueries({
  parentSpan,
  queryIds,
  store,
  program,
  graphqlRunner,
}: Partial<IQueryRunningContext>): Promise<void> {
  if (!store) {
    reporter.panic(`Cannot run service without a redux store`)
  }
  if (!queryIds) {
    return
  }
  const { pageQueryIds } = queryIds
  const state = store.getState()
  const pageQueryIdsCount = pageQueryIds.filter(id => state.pages.has(id))
    .length

  if (!pageQueryIdsCount) {
    return
  }

  const activity = reporter.createProgress(
    `run page queries`,
    pageQueryIdsCount,
    0,
    {
      id: `page-query-running`,
      parentSpan,
    }
  )

  activity.start()
  await processPageQueries(pageQueryIds, {
    state,
    activity,
    graphqlRunner,
    graphqlTracing: program?.graphqlTracing,
  })

  activity.done()
}
