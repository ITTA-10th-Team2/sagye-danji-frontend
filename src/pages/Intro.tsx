import { useNavigate } from 'react-router-dom';
import { Paragraph, Button } from '@toss/tds-mobile';

export default function Intro() {
  const navigate = useNavigate();

  return (
    <main className="w-full h-dvh flex flex-col justify-center items-center">
      <Paragraph.Text>임시 인트로 페이지입니다.</Paragraph.Text>
      <Button onClick={() => navigate('/home')}>홈으로 넘어가기</Button>
    </main>
  );
}
