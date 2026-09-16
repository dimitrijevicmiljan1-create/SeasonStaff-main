<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
## Review Rules

When /review is triggered:
- Never edit code during review — feedback only
- Check code quality and structure
- Check database schema and RLS policies
- Check organization isolation
- Check edge functions if present
- Verify Supabase MCP is used for all DB operations
- Never suggest supabase db push or migration files
- Check folder structure follows project conventions
- Report issues by severity: Critical, High, Medium, Low
