
export async function getTextAnswer(question, qnaId=null) {
    const response = await fetch('/text-answer', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            qna_id: qnaId
        })
    });

    const data = await response.json();

    return data;
}
