import { forwardRef } from 'react'
import type { MatchShareCardPayload, ShareCardTeam, ShareCardTeamPlayer } from '~/lib/match_share_card'

const CARD_WIDTH = 1080

const colors = {
  sand: '#f0e4d6',
  sky: '#d9eef5',
  mist: '#f4f7fa',
  text: '#44403c',
  textMuted: '#78716c',
  teal: '#0f766e',
  tealDark: '#115e59',
  tealLight: '#ccfbf1',
  winnerBorder: '#14b8a6',
  winnerBg: 'linear-gradient(135deg, rgba(204, 251, 241, 0.95) 0%, rgba(167, 243, 208, 0.75) 100%)',
  winnerGlow: '0 8px 32px rgba(20, 184, 166, 0.28)',
  winnerGold: '#b45309',
  loserBorder: '#e7e5e4',
  loserBg: 'rgba(255, 255, 255, 0.72)',
}

type Props = {
  card: MatchShareCardPayload
  tagline: string
}

function frameOuterSize(photoPx: number, photoInset: number) {
  const inset = Math.min(Math.max(photoInset, 0), 49)
  const innerPhotoRatio = 1 - (inset * 2) / 100
  if (innerPhotoRatio <= 0) return photoPx
  return photoPx / innerPhotoRatio
}

function ShareAvatar({
  player,
  size,
  borderColor,
}: {
  player: ShareCardTeamPlayer
  size: number
  borderColor: string
}) {
  const { initials, avatarUrl, avatarFrameSrc, avatarFrameInset = 18 } = player

  if (avatarFrameSrc) {
    const framePx = frameOuterSize(size, avatarFrameInset)
    const photoOffset = (framePx - size) / 2

    return (
      <div style={{ position: 'relative', width: framePx, height: framePx, flexShrink: 0 }}>
        <div
          style={{
            position: 'absolute',
            left: photoOffset,
            top: photoOffset,
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            background: colors.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#fff', fontSize: size * 0.34, fontWeight: 700 }}>{initials}</span>
          )}
        </div>
        <img
          src={avatarFrameSrc}
          alt=""
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: framePx,
            height: framePx,
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${borderColor}`,
        overflow: 'hidden',
        background: colors.teal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#fff', fontSize: size * 0.34, fontWeight: 700 }}>{initials}</span>
      )}
    </div>
  )
}

function PlayerRow({
  player,
  borderColor,
  highlight,
  isWinnerTeam,
}: {
  player: ShareCardTeamPlayer
  borderColor: string
  highlight?: boolean
  isWinnerTeam?: boolean
}) {
  const avatarSize = isWinnerTeam ? 64 : 52

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: highlight ? '10px 12px' : isWinnerTeam ? '8px 0' : '6px 0',
        borderRadius: highlight ? 16 : 0,
        background: highlight ? 'rgba(15, 118, 110, 0.1)' : 'transparent',
      }}
    >
      <ShareAvatar player={player} size={avatarSize} borderColor={borderColor} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              fontSize: isWinnerTeam ? 28 : 24,
              fontWeight: 700,
              color: isWinnerTeam ? colors.tealDark : colors.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {player.displayName}
          </span>
          {player.equippedTitle && (
            <span
              title={player.equippedTitle.name}
              style={{
                flexShrink: 0,
                fontSize: isWinnerTeam ? 24 : 20,
                lineHeight: 1,
                padding: '4px 8px',
                borderRadius: 999,
                background: isWinnerTeam ? 'rgba(255, 255, 255, 0.85)' : colors.tealLight,
              }}
            >
              {player.equippedTitle.icon}
            </span>
          )}
        </div>
        {player.funLabel && (
          <p
            style={{
              margin: '2px 0 0',
              fontSize: 20,
              fontStyle: 'italic',
              color: colors.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {player.funLabel}
          </p>
        )}
      </div>
    </div>
  )
}

function TeamBlock({
  title,
  team,
  variant,
  highlightPlayerName,
}: {
  title: string
  team: ShareCardTeam
  variant: 'winner' | 'loser'
  highlightPlayerName?: string
}) {
  const isWinner = variant === 'winner'

  return (
    <section
      style={{
        borderRadius: isWinner ? 28 : 24,
        border: isWinner ? `3px solid ${colors.winnerBorder}` : `2px solid ${colors.loserBorder}`,
        background: isWinner ? colors.winnerBg : colors.loserBg,
        boxShadow: isWinner ? colors.winnerGlow : 'none',
        padding: isWinner ? '24px 28px' : '18px 24px',
        transform: isWinner ? 'scale(1)' : 'scale(0.98)',
        transformOrigin: 'top center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 6,
        }}
      >
        {isWinner && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              fontSize: 22,
              boxShadow: '0 2px 8px rgba(20, 184, 166, 0.2)',
            }}
          >
            🏆
          </span>
        )}
        <p
          style={{
            margin: 0,
            fontSize: isWinner ? 24 : 20,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: isWinner ? colors.tealDark : colors.textMuted,
          }}
        >
          {title}
        </p>
        {isWinner && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: colors.winnerGold,
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '6px 14px',
              borderRadius: 999,
            }}
          >
            Campeões
          </span>
        )}
      </div>
      <p
        style={{
          margin: '0 0 16px',
          fontSize: isWinner ? 34 : 26,
          fontWeight: 800,
          color: isWinner ? colors.tealDark : colors.text,
          letterSpacing: isWinner ? '0.01em' : 0,
        }}
      >
        {team.label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isWinner ? 10 : 8 }}>
        {team.players.map((player) => (
          <PlayerRow
            key={player.displayName}
            player={player}
            borderColor={isWinner ? colors.teal : '#d6d3d1'}
            highlight={highlightPlayerName === player.displayName}
            isWinnerTeam={isWinner}
          />
        ))}
      </div>
    </section>
  )
}

const MatchShareCard = forwardRef<HTMLDivElement, Props>(function MatchShareCard(
  { card, tagline },
  ref
) {
  const winnerTeam = card.teams.find((team) => team.isWinner)!
  const loserTeam = card.teams.find((team) => !team.isWinner)!
  const hostname = card.appUrl.replace(/^https?:\/\//, '')

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        width: CARD_WIDTH,
        boxSizing: 'border-box',
        padding: '44px 48px 40px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        backgroundColor: colors.mist,
        background: `linear-gradient(180deg, ${colors.sky} 0%, ${colors.mist} 42%, ${colors.sand} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(186, 230, 253, 0.35)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'rgba(237, 201, 165, 0.28)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: colors.teal,
            }}
          >
            Arena Rank · {card.playName}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 26, color: colors.textMuted }}>{card.arenaName}</p>
        </header>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.textMuted,
            }}
          >
            Placar
          </p>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1,
              color: colors.tealDark,
              letterSpacing: '0.04em',
            }}
          >
            {card.scoreLabel}
          </p>
          <p
            style={{
              margin: '14px 0 0',
              fontSize: 26,
              fontWeight: 700,
              color: colors.teal,
            }}
          >
            🥇 {winnerTeam.label}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TeamBlock
            title="Vencedores"
            team={winnerTeam}
            variant="winner"
            highlightPlayerName={card.viewer?.isWinner ? card.viewer.displayName : undefined}
          />
          <TeamBlock
            title="Derrotados"
            team={loserTeam}
            variant="loser"
            highlightPlayerName={card.viewer && !card.viewer.isWinner ? card.viewer.displayName : undefined}
          />
        </div>

        <footer
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: `1px solid rgba(120, 113, 108, 0.2)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 20, color: colors.textMuted, lineHeight: 1.35 }}>
            {tagline}
          </p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.teal, textAlign: 'right' }}>
            {hostname}
          </p>
        </footer>
      </div>
    </div>
  )
})

export default MatchShareCard

function collectAvatarUrls(card: MatchShareCardPayload): string[] {
  const urls: string[] = []

  for (const team of card.teams ?? []) {
    for (const player of team.players) {
      if (player.avatarUrl) urls.push(player.avatarUrl)
      if (player.avatarFrameSrc) urls.push(player.avatarFrameSrc)
    }
  }

  return urls
}

export { collectAvatarUrls }
