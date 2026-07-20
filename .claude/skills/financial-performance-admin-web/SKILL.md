---
name: financial-performance-admin-web
description: Use for all Next.js admin dashboard tasks in the Financial Performance Platform, including authentication, client management, imports, review, reports, charts, forms, RTL, API integration, and tests.
---


# Financial Performance Platform — Project Agent Rules

هذه التعليمات خاصة بمنصة متابعة الأداء المالي والتشغيلي للمطاعم والكافيهات.
تُطبق بجانب تعليمات الأدوات أو Laravel Boost الموجودة بالفعل، ولا تُلغيها.

## ترتيب أولوية المراجع

عند التعارض اتبع الترتيب التالي:

1. قرار بشري صريح داخل المحادثة أو `DECISIONS_LOG.md`.
2. `CURRENT_SLICE.md` المعتمد.
3. المواصفات الموجودة داخل `../project-docs/specifications/`.
4. ملف Skill الخاص بالـRepository.
5. `AGENTS.md` وتعليمات الأدوات العامة.
6. الافتراضات الشخصية للـAgent، وهي أقل أولوية ولا تُستخدم عند وجود غموض جوهري.

## قاعدة العمل

لا تبدأ تنفيذًا واسعًا مباشرة. ابدأ بخطة محدودة، واذكر:
- الهدف.
- الملفات المتوقعة.
- التغييرات على قاعدة البيانات أو الـAPI.
- الاختبارات.
- المخاطر.
- ما هو خارج النطاق.

لا تنفذ إلا بعد اعتماد الخطة عندما تكون المهمة مصنفة كـPlan First.


## هوية التطبيق

- Next.js App Router.
- TypeScript Strict.
- Tailwind CSS.
- shadcn/ui.
- TanStack Query.
- TanStack Table عند الحاجة.
- React Hook Form + Zod.
- Recharts عبر shadcn Charts.
- Day.js + UTC/Timezone.
- مدير النظام فقط.

## المصادقة

- Sanctum Stateful Cookie.
- HttpOnly Cookie.
- CSRF.
- ممنوع تخزين Access Token في LocalStorage أو SessionStorage.
- تعامل واضح مع 401 و419 وانتهاء الجلسة.

## API Contracts

المصدر:

```text
Laravel Scramble OpenAPI
→ openapi-typescript
→ generated types
```

- لا تكتب Response types يدويًا عند وجود Generated Type.
- لا تعدل الملفات Generated.
- لا تخترع Endpoint.
- عند نقص العقد، أوقف التنفيذ وسجل Contract Gap.

## UI وRTL

- العربية فقط في الـMVP.
- Direction RTL افتراضيًا.
- استخدم مكونات مشتركة للحالات:
  - Loading.
  - Empty.
  - Error.
  - Partial data.
  - Not available.
- لا تعرض Missing كصفر.
- كل تقرير يوضح العميل، الفرع، الفترة، وقت آخر نشر، وحالة توفر البيانات.
- التصميم Responsive لسطح المكتب والتابلت.

## إدارة الحالة

- Server State في TanStack Query.
- لا تكرر Server State في Zustand أو Context.
- Local UI State فقط محليًا.
- Invalidation بعد Mutations.
- Query keys تشمل العميل والفترة والفرع.

## النماذج

- React Hook Form.
- Zod للتحقق التفاعلي.
- Backend يظل مصدر الحقيقة.
- اعرض أخطاء 422 بجوار الحقول.
- لا تخفِ أخطاء الأعمال في Toast عام فقط.

## التقارير

- الرسوم لا تحل محل الأرقام.
- استخدم نفس صيغة SAR والنسب عبر التطبيق.
- لا تستخدم Pie Chart عندما تكون المقارنة صعبة.
- لا تحسب مؤشرات مالية أساسية داخل الواجهة؛ تأتي من Backend.
- يمكن للواجهة إجراء تنسيقات عرض فقط.

## الاستيراد والمراجعة

- رفع Excel.
- عرض Progress.
- عرض أخطاء وتحذيرات.
- Preview.
- Submit for Review.
- Publish بConfirmation واضح.
- لا تعتبر Upload = Publish.
- لا تعرض بيانات Draft لتطبيق العميل.

## الجودة

- Type check.
- ESLint.
- Vitest.
- Testing Library.
- Build.
- اختبر Guards والنماذج وحالات API والبيانات الجزئية.

## ممنوعات

- Pages Router.
- تخزين Tokens في المتصفح.
- Business formulas في React components.
- استدعاءات fetch عشوائية خارج طبقة API.
- اختراع Types أو Endpoints.
- Components ضخمة بلا فصل.
- تعديل Backend contract ضمن مهمة Web دون تصريح.
