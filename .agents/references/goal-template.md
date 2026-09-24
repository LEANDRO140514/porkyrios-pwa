# Goal Template

Copy this template when creating a new goal in `.agents/memory/goal-registry.json`.

## Goal Entry

```json
{
  "id": "unique-goal-id",
  "title": "Short descriptive title",
  "scope": ["src/**/*.js", "test/**/*.test.js"],
  "acceptance": "What 'done' looks like for this goal",
  "verification": ["npm test", "npm run lint"],
  "commitExpectation": true,
  "pushExpectation": false,
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "archived": false
}
```

## Field Descriptions

- `id`: Unique identifier for the goal (kebab-case recommended).
- `title`: Short, human-readable description of the goal.
- `scope`: Array of file path globs the goal may read or write.
- `acceptance`: A sentence describing what conditions must be met for completion.
- `verification`: Array of shell commands that must pass before marking complete.
- `commitExpectation`: Whether changes must be committed upon completion.
- `pushExpectation`: Whether the branch must be pushed upon completion.
- `status`: One of `pending`, `active`, `completed`, or `abandoned`.
- `createdAt`: ISO 8601 timestamp when the goal was created.
- `updatedAt`: ISO 8601 timestamp of the most recent status change.
- `archived`: Set to `true` for completed goals older than 30 days.
