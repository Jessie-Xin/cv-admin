import type { ResumeData } from "@/lib/resume-data";

export function ResumeView({ data }: { data: ResumeData }) {
  const { profile, projects, milestones, experiences, categories } = data;

  return (
    <article className="mx-auto max-w-3xl bg-white text-neutral-900 px-12 py-14 print:p-10 shadow-sm rounded-lg print:shadow-none print:rounded-none">
      {/* 头部 */}
      <header className="flex items-center gap-6 pb-6 border-b">
        <div
          className="w-20 h-20 rounded-full shrink-0"
          style={{ background: data.accentColor }}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">{profile.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {profile.subtitle ?? profile.jobTitle}
          </p>
          <div className="text-xs text-neutral-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {profile.email && <span>{profile.email}</span>}
            {profile.phone && <span>{profile.phone}</span>}
            {profile.city && <span>{profile.city}</span>}
            {profile.github && <span>{profile.github}</span>}
          </div>
        </div>
      </header>

      {/* 简介 */}
      {profile.bio && (
        <Section title="个人简介" accent={data.accentColor}>
          <p className="text-sm leading-relaxed text-neutral-700">
            {profile.bio}
          </p>
        </Section>
      )}

      {/* 工作 / 教育 */}
      <Section title="个人历程" accent={data.accentColor}>
        <div className="space-y-3">
          {experiences.map((e) => (
            <div key={e.id} className="flex items-baseline gap-4">
              <div className="w-28 shrink-0 text-xs text-neutral-500 pt-0.5">
                {formatRange(e.startDate, e.endDate, e.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{e.title}</div>
                <div className="text-sm text-neutral-600 mt-1">
                  {e.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 项目 */}
      <Section title="代表项目" accent={data.accentColor}>
        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="flex items-start gap-4">
              <span
                className="w-1 mt-1.5 h-4 rounded-sm shrink-0"
                style={{ background: p.accentColor ?? data.accentColor }}
              />
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-xs text-neutral-500">
                    {formatRange(p.startDate, p.endDate)}
                  </span>
                </div>
                <div className="text-sm text-neutral-600 mt-0.5">
                  {p.description}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  角色：{p.role}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: (p.accentColor ?? data.accentColor) + "1f",
                        color: p.accentColor ?? data.accentColor,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 技能 */}
      <Section title="技能标签" accent={data.accentColor}>
        <div className="space-y-2.5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-baseline gap-4">
              <div className="w-28 shrink-0 text-xs font-medium text-neutral-700">
                {c.name}
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {c.skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: (c.color ?? data.accentColor) + "1f",
                      color: c.color ?? data.accentColor,
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 里程碑 */}
      {milestones.length > 0 && (
        <Section title="项目里程碑" accent={data.accentColor}>
          <div className="space-y-2.5">
            {milestones.map((m) => {
              const d = new Date(m.occurredAt);
              return (
                <div key={m.id} className="flex items-baseline gap-4">
                  <div className="w-28 shrink-0 text-xs text-neutral-500">
                    {d.getFullYear()}.{String(d.getMonth() + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{m.title}</div>
                    <div className="text-sm text-neutral-600 mt-0.5">
                      {m.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </article>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider mb-3 pb-1.5 border-b-2"
        style={{ color: accent, borderColor: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function formatRange(
  start: Date | string,
  end: Date | string | null,
  type?: string,
) {
  const fmt = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  if (type === "CERTIFICATION") return `${fmt(start)} 获取`;
  return `${fmt(start)} — ${end ? fmt(end) : "至今"}`;
}
