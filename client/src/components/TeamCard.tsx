interface Props { name: string; role: string; introduction: string; languages: string; image: string }
export function TeamCard(props: Props) {
  return <article className="team-card"><div className="team-photo">{props.image ? <><img src={props.image} alt="Illustrative home care support photograph; not an identified staff member" loading="lazy" /><span className="team-photo-caption">Illustrative image</span></> : <span>Staff photo<br />coming soon</span>}</div><div><h3>{props.name}</h3><p className="team-role">{props.role}</p><p>{props.introduction}</p><p className="team-languages">{props.languages}</p></div></article>;
}
