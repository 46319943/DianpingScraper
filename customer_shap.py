import os

os.environ['CUDA_VISIBLE_DEVICES'] = '0'
import paddlehub as hub

sentimentor = hub.Module(name="ernie_skep_sentiment_analysis")


def explain_wrapper(docs):
    return_list = []
    result_list = sentimentor.predict_sentiment(docs, use_gpu=True)
    for result in result_list:
        return_list.append(
            [result['positive_probs'], result['negative_probs']]
        )
    return return_list


from slab_nlp.segmentation import PKUSegment

segmentor = PKUSegment()


def custom_tokenizer(s: str, return_offsets_mapping=True):
    """ Custom tokenizers conform to a subset of the transformers API.
    """
    word_segment, tag_segment = segmentor.segment_text(s)

    out = {}
    out['input_ids'] = word_segment
    offset_ranges = []
    last_index = 0
    for word in word_segment:
        offset_ranges.append(
            (last_index, last_index + len(word))
        )
        last_index = last_index + len(word)
    if return_offsets_mapping:
        out["offset_mapping"] = offset_ranges
    return out


import shap

masker = shap.maskers.Text(custom_tokenizer)
explainer = shap.Explainer(explain_wrapper, masker, output_names=['积极', '消极'])

if __name__ == '__main__':
    shap_values = explainer(["我去图书馆学习了，但是没有预约到座位"])
    shap.plots.text(shap_values[0, :, "积极"])


def explain_text(s):
    shap_values = explainer([s])
    token_list = shap_values.values[0, :, 0].tolist()
    shap_list = shap_values.feature_names[0]
    token_shap_list = list(zip(
        token_list,
        shap_list
    ))
    return token_shap_list
