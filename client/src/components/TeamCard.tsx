interface Props { name: string; role: string; introduction: string; languages: string; image: string; imageAlt: string; photoPending: string[] }
export function TeamCard(props: Props) {
  return <article className="team-card"><div className="team-photo">{props.image ? <><img src={props.image} alt={props.imageAlt} loading="lazy" /></> : <span>{props.photoPending[0]}<br />{props.photoPending[1]}</span>}</div><div><h3>{props.name}</h3><p className="team-role">{props.role}</p><p>{props.introduction}</p><p className="team-languages">{props.languages}</p></div></article>;
}
