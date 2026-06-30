<template>
  <div>
    <CardTypeOA
      v-if="['OA', 'D'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeS
      v-else-if="['S', 'MI'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeF
      v-else-if="['F'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeMIDF
      v-else-if="['MIDF'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeMINV
      v-else-if="['MINV'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeSBN
      v-else-if="['SBN'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeJson
      v-else-if="['JSON'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />
    <CardTypeInterview
      v-else-if="['INTERVISTA'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />    
    <CardTypeSalon
      v-else-if="['SALON'].includes(cardType) && cardDetail && imageSlug"
      :card-detail="cardDetail"
      :slug="imageSlug"
    />       
    <div v-else>
      <h1>No card for this type: {{ cardType }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import CardTypeF from '~/components/Osd/F/CardTypeF.vue'
import CardTypeJson from '~/components/Osd/Json/CardTypeJson.vue'
import CardTypeMIDF from '~/components/Osd/Midf/CardTypeMIDF.vue'
import CardTypeMINV from '~/components/Osd/Minv/CardTypeMINV.vue'
import CardTypeOA from '~/components/Osd/OA/CardTypeOA.vue'
import CardTypeS from '~/components/Osd/S/CardTypeS.vue'
import CardTypeSBN from '~/components/Osd/Sbn/CardTypeSBN.vue'
import CardTypeInterview from '~/components/Osd/Interview/CardTypeInterview.vue'
import CardTypeSalon from '~/components/Osd/Salon/CardTypeSalon.vue'
import { GetDataUtils } from '~/utils/GetDataUtils'

const { locale } = useI18n()
const route = useRoute('digital-object-slug___en')
const cardType = ref('')

const imageSlug = computed(() => {
  const p = route.params.slug
  const s = Array.isArray(p) ? p[0] : p
  return typeof s === 'string' ? s : ''
})

const { data: cardDetail } = await useFetch(() => `/api/cardDetail/${imageSlug.value}`, {
  query: {
    locale: locale.value,
  },
  watch: [imageSlug],
})

watch(cardDetail, () => {
  if (cardDetail.value?.record_json) {
    const record_json = JSON.parse(cardDetail.value.record_json)
    // console.log(record_json)
    cardType.value = GetDataUtils.getSingleField(record_json, GetDataUtils.FIELD_CARD_TYPE) as string
  }
}, { immediate: true })
</script>
