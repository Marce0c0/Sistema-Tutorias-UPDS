const postTopic = async () => {
  const payload = {
    courseId: '7602b258-16be-4d49-9160-19d5e2b14422',
    userId: 'fbedb367-859b-467b-a1bc-5ec7e37e7206',
    title: '¿Alguien busca equipo para el Hackathon Innova Tech 2026?',
    content: `<!--upds_meta:{"category":"equipo","channel":"event:hackathon-cbba-2026","coverImage":null}-->
Somos 2 desarrolladores frontend con React y buscamos a alguien que domine Python o backend Node.js para postular una app de Smart City. ¡Comenta aquí si te interesa sumarte!`
  };

  const res = await fetch('http://localhost:3001/api/forums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Created post:', data);
};

postTopic();
