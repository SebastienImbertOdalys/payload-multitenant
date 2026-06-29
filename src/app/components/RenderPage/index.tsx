import type { Page } from '@payload-types'

import React from 'react'

export const RenderPage = ({ data }: { data: Page }) => {
  const tenant = typeof data.tenant === 'object' ? data.tenant : null

  return (
    <main
      style={{
        display: 'grid',
        gap: '1.5rem',
        margin: '0 auto',
        maxWidth: '960px',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <form action="/api/users/logout" method="post">
        <button type="submit">Logout</button>
      </form>

      <header style={{ display: 'grid', gap: '.5rem' }}>
        {tenant?.name ? (
          <p style={{ fontSize: '.875rem', letterSpacing: '.08em', margin: 0, textTransform: 'uppercase' }}>
            {tenant.name}
          </p>
        ) : null}
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', margin: 0 }}>{data.title || 'Untitled page'}</h1>
        <p style={{ color: '#5f5f5f', margin: 0 }}>/{data.slug || 'home'}</p>
      </header>

      {data.content?.length ? (
        <section style={{ display: 'grid', gap: '1.5rem' }}>
          {data.content.map((block) => {
            if (block.blockType !== 'cta') {
              return null
            }

            return (
              <article
                key={block.id || block.blockName || block.heading}
                style={{
                  background: block.backgroundColor || '#0066cc',
                  borderRadius: '24px',
                  color: '#fff',
                  display: 'grid',
                  gap: '1rem',
                  padding: '2rem',
                }}
              >
                <div style={{ display: 'grid', gap: '.75rem' }}>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0 }}>{block.heading}</h2>
                  {block.description ? <p style={{ margin: 0, maxWidth: '42rem' }}>{block.description}</p> : null}
                </div>

                <div>
                  <a
                    href={block.buttonLink}
                    style={{
                      background: '#fff',
                      borderRadius: '999px',
                      color: '#111',
                      display: 'inline-flex',
                      fontWeight: 600,
                      padding: '.85rem 1.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    {block.buttonLabel}
                  </a>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <section
          style={{
            background: '#f5f5f5',
            borderRadius: '24px',
            padding: '2rem',
          }}
        >
          <p style={{ margin: 0 }}>No blocks yet. Add a CTA block from the editor to preview it here.</p>
        </section>
      )}
    </main>
  )
}
