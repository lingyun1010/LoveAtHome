interface Props { name: string; role: string; introduction: string; languages: string }
export function TeamCard(props: Props) {
  return <article className="team-card"><div className="team-photo" role="img" aria-label="Team member photo placeholder"><span>Photo<br />placeholder</span></div><div><h3>{props.name}</h3><p className="team-role">{props.role}</p><p>{props.introduction}</p><p className="team-languages">{props.languages}</p></div></article>;
}

