export type Template = { id: string; title: string; src: string };
export type PublicItem = { id: string; title: string; image: string; templateId: string };

export const templates: Template[] = [
  { id: 'drake', title: '드레이크', src: '/templates/drake.svg' },
  { id: 'doge', title: '도지', src: '/templates/doge.svg' },
  { id: 'spongebob', title: '스폰지밥', src: '/templates/spongebob.svg' },
  { id: 'discipline', title: '참교육', src: '/templates/discipline.svg' },
  { id: 'galaxy', title: '우주', src: '/templates/galaxy.svg' },
  { id: 'retro', title: '레트로', src: '/templates/retro.svg' },
  { id: '금쪽이', title: '금쪽이', src: '/templates/gumzok.png' },
  { id: 'puppy', title: 'ㅆ..쒸..씌익', src: '/templates/puppy.png' },
  { id: 'board', title: '인생 좌우명', src: '/templates/board.png' },
  { id: 'tired', title: '지치고 고된 아침', src: '/templates/tired.png'},
  { id: 'monkey', title: '인생 날로먹고 싶따..', src: '/templates/monkey.png'}
];

export const publicItems: PublicItem[] = [
  { id: 'p1', title: '예시 1', image: '/templates/doge.svg', templateId: 'doge' },
  { id: 'p2', title: '예시 2', image: '/templates/drake.svg', templateId: 'drake' },
  { id: 'p3', title: '예시 3', image: '/templates/retro.svg', templateId: 'retro' },
  { id: 'p4', title: '예시 4', image: '/templates/galaxy.svg', templateId: 'galaxy' },
  { id: 'p5', title: '예시 5', image: '/templates/discipline.svg', templateId: 'discipline' },
  { id: 'p6', title: '예시 6', image: '/templates/spongebob.svg', templateId: 'spongebob' },
  { id: 'p7', title: '예시 7', image: '/templates/gumzok.png', templateId: '금쪽이' },
  { id: 'p8', title: '예시 8', image: '/templates/puppy.png', templateId: 'puppy' },
  { id: 'p9', title: '예시 9', image: '/templates/board.png', templateId: 'board' },
  { id: 'p10', title: '예시 10', image: '/templates/tired.png', templateId: 'tired' },
  { id: 'p11', title: '예시 11', image: '/templates/monkey.png', templateId: 'monkey' }
];