import madeWithAI from '../madeWithAI';

const fileOf = (text) => {
  return new File([text], 'picture.jpg', { type: 'image/jpeg' });
};

describe('madeWithAI', () => {
  it('believes a file whose XMP says it was made by AI', async () => {
    const xmp = '<rdf:Description Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/>';
    expect(await madeWithAI.says(fileOf(`\xFF\xD8${xmp}`))).toBe(true);
  });

  it('believes a composite made partly with AI', async () => {
    expect(await madeWithAI.says(fileOf('c2pa.actions digitalsourcetype/compositeWithTrainedAlgorithmicMedia'))).toBe(true);
  });

  it('says nothing of a file without the sign', async () => {
    expect(await madeWithAI.says(fileOf('\xFF\xD8 a photo from a camera, algorithmicMedia'))).toBe(false);
    expect(await madeWithAI.says(null)).toBe(false);
  });

  it('is so when any of several files says so', async () => {
    expect(await madeWithAI.any([fileOf('plain'), fileOf('trainedAlgorithmicMedia')])).toBe(true);
    expect(await madeWithAI.any([fileOf('plain')])).toBe(false);
  });
});
