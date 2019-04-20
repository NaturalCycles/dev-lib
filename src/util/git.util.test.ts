import { commitMessageToTitleMessage, getLastGitCommitMsg, gitHasUncommittedChanges } from './git.util'

test('getLastGitCommitMsg', async () => {
  const msg = await getLastGitCommitMsg()
  console.log({msg})
  expect(msg).not.toBeUndefined()

  const title = commitMessageToTitleMessage(msg)
  console.log({title})
  expect(title).not.toBeUndefined()
})

test('gitHasUncommittedChanges', async () => {
  await gitHasUncommittedChanges()
})
