import { useMemo } from 'react';
import type { BirdCard } from '../types/BirdCard';

const CARD_HEIGHT = 460;
const CARD_RATIO = 0.655;

// Resolve asset URLs via Vite's import.meta.url for dev + production
function iconUrl(name: string): string {
  return new URL(`../../assets/icons/${name}.png`, import.meta.url).href;
}
function birdImageUrl(id: number): string {
  return new URL(`../../assets/cards/birds/${id}.png`, import.meta.url).href;
}
function powerBgUrl(color: string): string {
  return new URL(`../../assets/powers/${color}.png`, import.meta.url).href;
}

/** Renders text containing [icon_name] tokens as inline icon images */
function Iconize({ text, className }: { text: string; className?: string }) {
  const cls = className ?? 'inline h-[1em] align-middle';
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]$/);
        if (match) {
          return <img key={i} src={iconUrl(match[1])} alt={match[1]} className={cls} />;
        }
        return part ? <span key={i}>{part}</span> : null;
      })}
    </>
  );
}

interface BirdDisplayProps {
  bird: BirdCard;
  cardHeight?: number;
}

export function BirdDisplay({ bird, cardHeight = CARD_HEIGHT }: BirdDisplayProps) {
  const cardWidth = cardHeight * CARD_RATIO;

  const habitats = useMemo(
    () => (['Wetland', 'Grassland', 'Forest'] as const).filter(h => bird[h]),
    [bird],
  );

  const eggs = useMemo(
    () => Array.from({ length: bird['Egg limit'] }, (_, i) => i),
    [bird],
  );

  const wingspanDisplay = `${bird.Wingspan}${String(bird.Wingspan) !== '*' ? 'cm' : ''}`;

  // Build food cost token string, e.g. "[fish]+[fish]" or "[seed]/[fruit]"
  const foodCostString = useMemo(() => {
    const food: Record<string, number | null> = {
      invertebrate: bird.Invertebrate,
      seed: bird.Seed,
      fruit: bird.Fruit,
      fish: bird.Fish,
      rodent: bird.Rodent,
      nectar: bird.Nectar,
      wild: bird['Wild (food)'],
    };
    const prefix = bird['* (food cost)'] ? '*' : '';
    const separator = bird['/ (food cost)'] ? '/' : '+';
    const tokens = Object.entries(food).flatMap(([name, count]) =>
      Array.from({ length: count || 0 }, () => `[${name}]`),
    );
    return prefix + (tokens.join(separator) || '[no-food]');
  }, [bird]);

  // Resolve nest type to icon name: "wild" → "star", "none" → null, else lowercase
  const nestType = useMemo(() => {
    const nestMap: Record<string, string | null> = { wild: 'star', none: null };
    const type = bird['Nest type'];
    return type in nestMap ? nestMap[type] : type.toLowerCase();
  }, [bird]);

  // Power-related icons (predator / flocking / bonus card)
  const powerIcons = useMemo(() => {
    const map: [keyof BirdCard, string][] = [
      ['Predator', 'predator'],
      ['Flocking', 'flocking'],
      ['Bonus card', 'bonus_cards'],
    ];
    return map.filter(([key]) => bird[key]).map(([, icon]) => icon);
  }, [bird]);

  const powerTitle = useMemo(() => {
    const textMap: Record<string, string> = {
      brown: 'WHEN ACTIVATED',
      white: 'WHEN PLAYED',
      pink: 'ONCE BETWEEN TURNS',
      teal: 'ROUND END',
      yellow: 'GAME END',
    };
    return bird.Color ? textMap[bird.Color] || '' : '';
  }, [bird]);

  // Dynamic font size for power text based on character count
  const powerFontSize = useMemo(() => {
    const charCount = bird['Power text']?.replace(/\[.*?\]/g, '1').length || 0;
    if (charCount <= 100) return cardHeight * 0.039;
    if (charCount <= 150) return cardHeight * 0.036;
    if (charCount <= 200) return cardHeight * 0.033;
    return cardHeight * 0.031;
  }, [bird, cardHeight]);

  const flavorFontSize = useMemo(() => {
    const charCount = bird['Flavor text']?.length || 0;
    return cardHeight * (charCount < 85 ? 0.025 : 0.023);
  }, [bird, cardHeight]);

  const powerColors = ['brown', 'white', 'pink', 'teal', 'yellow', 'green'];

  return (
    <div
      className="relative bg-no-repeat rounded-lg overflow-hidden shadow-xl bg-[#f5f6f1]"
      style={{
        width: cardWidth,
        height: cardHeight,
        backgroundImage: `url(${birdImageUrl(bird.id)})`,
        backgroundSize: '85%',
        backgroundPositionY: 'center',
        backgroundPositionX: 'right',
        containerType: 'inline-size',
      }}
    >
      {/* ── Upper Row: Habitats / Food + Title ── */}
      <div className="flex" style={{ height: '22%' }}>
        {/* Grey Square */}
        <div
          className="bg-[#c7c1b3] rounded-bl rounded-br"
          style={{
            width: '27.27%',
            height: '100%',
            marginLeft: '6.8%',
            borderStyle: 'solid',
            borderTopStyle: 'none',
            borderWidth: 0.5,
            borderColor: '#74685e',
          }}
        >
          {/* Habitats */}
          <div className="flex justify-center items-end relative" style={{ height: '65%', width: '100%' }}>
            {habitats.map((habitat, i) => (
              <img
                key={habitat}
                src={iconUrl(habitat.toLowerCase())}
                alt={habitat}
                className={habitats.length === 3 && i === 1 ? 'absolute' : ''}
                style={{
                  maxHeight: '56.3%',
                  maxWidth: '45.8%',
                  ...(habitats.length === 3 && i === 1 ? { top: '12%' } : {}),
                }}
              />
            ))}
          </div>
          {/* Food Cost */}
          <div
            className="flex items-center justify-center"
            style={{
              height: '35%',
              width: '100%',
              fontSize: cardHeight * 0.04,
              lineHeight: `${cardHeight * 0.04}px`,
              fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif',
            }}
          >
            <Iconize text={foodCostString} />
          </div>
        </div>

        {/* Title Area */}
        <div
          className="flex-grow flex flex-col justify-center text-center my-auto bg-[#f5f6f1]"
          style={{
            borderStyle: 'solid',
            borderRightStyle: 'none',
            borderWidth: cardHeight / 460,
            borderColor: '#000000',
            height: '56%',
            marginLeft: '1.8%',
          }}
        >
          <div
            style={{
              fontSize: cardHeight * 0.042,
              lineHeight: `${cardHeight * 0.042}px`,
              fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif',
            }}
          >
            {bird['Common name']}
          </div>
          {bird['Native name'] && (
            <div
              style={{
                fontSize: cardHeight * 0.045,
                lineHeight: `${cardHeight * 0.045}px`,
                fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif',
                color: '#c0c0c0',
              }}
            >
              {bird['Native name']}
            </div>
          )}
          <div
            style={{
              fontSize: cardHeight * 0.03,
              lineHeight: `${cardHeight * 0.035}px`,
              fontFamily: 'ThirstyRoughLt, Arial, Helvetica',
              color: '#666666',
            }}
          >
            {bird['Scientific name']}
          </div>
        </div>
      </div>

      {/* ── Middle Row: VP / Nest / Eggs + Wingspan ── */}
      <div className="flex items-center justify-between" style={{ width: '100%', height: '47.7%' }}>
        {/* Left Column */}
        <div className="flex flex-col" style={{ height: '100%', width: '13%', marginLeft: '7%' }}>
          {/* Victory Points */}
          <span
            className="relative"
            style={{
              color: '#4a4139',
              fontSize: cardHeight * 0.064,
              lineHeight: `${cardHeight * 0.064}px`,
              fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif',
              maxHeight: '15%',
              paddingTop: '36%',
              paddingBottom: '50%',
              marginTop: '80%',
            }}
          >
            {bird['Victory points']}
            <img
              src={iconUrl('point')}
              alt="point"
              className="absolute"
              style={{ maxHeight: '120%', maxWidth: '120%', top: '30%', left: '20%' }}
            />
          </span>

          {/* Nest Type */}
          {nestType && (
            <img
              src={iconUrl(nestType)}
              alt={bird['Nest type']}
              className="relative"
              style={{ maxWidth: '90%', maxHeight: '90%', left: '-6%', padding: '0 5%', marginTop: '65%' }}
            />
          )}

          {/* Eggs */}
          <div className="flex flex-wrap" style={{ marginTop: '20%' }}>
            {eggs.map((_, i) => (
              <img
                key={i}
                src={iconUrl('smallegg')}
                alt="egg"
                style={{ maxWidth: '26%', margin: '10% 5%', maxHeight: cardHeight / 20.64 }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Wingspan */}
        <div
          className="flex flex-col items-center justify-end"
          style={{ height: '90%', width: '18%', marginRight: '7%' }}
        >
          <span
            style={{
              color: '#666666',
              fontSize: cardHeight * 0.034,
              lineHeight: `${cardHeight * 0.034}px`,
              fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif',
              marginBottom: '20%',
              marginLeft: '10%',
            }}
          >
            {wingspanDisplay}
          </span>
          <img
            src={iconUrl('wingspan')}
            alt="wingspan"
            className="absolute"
            style={{ width: cardWidth * 0.15, right: cardWidth * 0.075 }}
          />
        </div>
      </div>

      {/* ── Power Row ── */}
      {bird.Color ? (
        <div
          className="flex items-center overflow-hidden"
          style={{
            height: '20%',
            width: '100%',
            padding: '2% 5%',
            fontSize: powerFontSize,
            backgroundImage: powerColors.includes(bird.Color) ? `url(${powerBgUrl(bird.Color)})` : undefined,
            backgroundSize: 'cover',
          }}
        >
          <div className="flex flex-row items-start gap-[3px] max-w-full max-h-full overflow-hidden">
            {powerIcons.length > 0 && (
              <div className="flex flex-col items-start gap-[3px] shrink-0" style={{ height: '100%' }}>
                {powerIcons.map(icon => (
                  <img key={icon} src={iconUrl(icon)} alt={icon} className="h-[1em] shrink-0" />
                ))}
              </div>
            )}
            <div className="overflow-hidden" style={{ fontFamily: '"Open Sans", sans-serif', fontOpticalSizing: 'auto', fontWeight: 400, fontStyle: 'normal', fontStretch: '75%', lineHeight: 1.15 }}>
              <span
                className="uppercase"
                style={{ fontFamily: 'CardenioModernBold, SiliciStrong, sans-serif' }}
              >
                {powerTitle}:{' '}
              </span>
              {bird['Power text'] && <Iconize text={bird['Power text']} />}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height: '20%', width: '100%' }} />
      )}

      {/* ── Footer ── */}
      <div className="flex justify-between" style={{ height: '9%', marginTop: '5px' }}>
        <div style={{ width: '7%' }} />
        <div
          className="italic"
          style={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: flavorFontSize,
            lineHeight: `${flavorFontSize + 1}px`,
          }}
        >
          <span className="text-start">{bird['Flavor text']}</span>
        </div>
        <div />
      </div>
    </div>
  );14532
}
