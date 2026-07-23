"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  CheckCircle2Icon,
  SendIcon,
  Trash2Icon,
  UndoIcon,
  UploadCloudIcon,
} from "lucide-react";

import {
  useApproveImport,
  useDeleteImport,
  usePublishImport,
  useReturnImportToDraft,
  useSubmitImport,
} from "@/hooks/use-imports";
import type { ImportBatchDetail } from "@/lib/imports";
import { formatDateTime } from "@/lib/import-sheets";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DialogKind = "submit" | "approve" | "publish" | "delete" | "return";

function actionError(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return "تعذّر تنفيذ العملية.";
}

function TimelineStep({
  done,
  title,
  actor,
  at,
}: {
  done: boolean;
  title: string;
  actor?: string | null;
  at?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2Icon
        className={done ? "mt-0.5 size-4 text-primary" : "mt-0.5 size-4 text-muted-foreground/40"}
      />
      <div className="flex flex-col">
        <span className={done ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{title}</span>
        {done ? (
          <span className="text-xs text-muted-foreground">
            {actor ?? "—"} · {formatDateTime(at)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ImportWorkflow({ batch }: { batch: ImportBatchDetail }) {
  const router = useRouter();
  const submit = useSubmitImport();
  const approve = useApproveImport();
  const publish = usePublishImport();
  const returnToDraft = useReturnImportToDraft();
  const remove = useDeleteImport();

  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pending =
    submit.isPending ||
    approve.isPending ||
    publish.isPending ||
    returnToDraft.isPending ||
    remove.isPending;

  const close = () => {
    setDialog(null);
    setNote("");
  };

  const run = (kind: Exclude<DialogKind, "return" | "delete">) => {
    setError(null);
    const mutation = kind === "submit" ? submit : kind === "approve" ? approve : publish;
    mutation.mutate(batch.id, {
      onSuccess: close,
      onError: (mutationError) => setError(actionError(mutationError)),
    });
  };

  const runReturn = () => {
    setError(null);
    returnToDraft.mutate(
      { id: batch.id, reviewNote: note.trim() },
      {
        onSuccess: close,
        onError: (mutationError) => setError(actionError(mutationError)),
      },
    );
  };

  const runDelete = () => {
    setError(null);
    remove.mutate(batch.id, {
      onSuccess: () => router.push("/dashboard/imports"),
      onError: (mutationError) => setError(actionError(mutationError)),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3">
        <TimelineStep done title="رُفع الملف" actor={batch.uploaded_by_name} at={batch.created_at} />
        <TimelineStep
          done={Boolean(batch.submitted_at)}
          title="قُدّم للمراجعة"
          actor={batch.submitted_by_name}
          at={batch.submitted_at}
        />
        <TimelineStep
          done={Boolean(batch.approved_at)}
          title="اعتُمد"
          actor={batch.approved_by_name}
          at={batch.approved_at}
        />
        <TimelineStep
          done={Boolean(batch.published_at)}
          title="نُشر"
          actor={batch.published_by_name}
          at={batch.published_at}
        />
      </div>

      {batch.review_note ? (
        <Alert>
          <AlertDescription>
            <span className="font-medium">ملاحظة الإرجاع: </span>
            {batch.review_note}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {batch.status === "draft" ? (
          <>
            <Button onClick={() => setDialog("submit")} disabled={pending}>
              <SendIcon />
              إرسال للمراجعة
            </Button>
            <Button variant="outline" onClick={() => setDialog("delete")} disabled={pending}>
              <Trash2Icon />
              حذف
            </Button>
          </>
        ) : null}

        {batch.status === "under_review" ? (
          <>
            <Button onClick={() => setDialog("approve")} disabled={pending}>
              <CheckCircle2Icon />
              اعتماد
            </Button>
            <Button variant="outline" onClick={() => setDialog("return")} disabled={pending}>
              <UndoIcon />
              إرجاع للمسودة
            </Button>
          </>
        ) : null}

        {batch.status === "approved" ? (
          <Button onClick={() => setDialog("publish")} disabled={pending}>
            <UploadCloudIcon />
            نشر
          </Button>
        ) : null}

        {batch.status === "validation_failed" ? (
          <Button variant="outline" onClick={() => setDialog("delete")} disabled={pending}>
            <Trash2Icon />
            حذف
          </Button>
        ) : null}

        {batch.status === "published" ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <CheckCircle2Icon className="size-4" />
            نسخة نهائية منشورة
          </span>
        ) : null}
      </div>

      <ConfirmDialog
        open={dialog === "submit"}
        onOpenChange={(open) => { if (!open) close(); }}
        title="إرسال العملية للمراجعة"
        description="لن تتمكن من حذف العملية بعد إرسالها للمراجعة."
        confirmLabel="إرسال"
        pending={submit.isPending}
        onConfirm={() => run("submit")}
      />

      <ConfirmDialog
        open={dialog === "approve"}
        onOpenChange={(open) => { if (!open) close(); }}
        title="اعتماد العملية"
        description="سيسمح الاعتماد بنشر هذه العملية لاحقًا."
        confirmLabel="اعتماد"
        pending={approve.isPending}
        onConfirm={() => run("approve")}
      />

      <ConfirmDialog
        open={dialog === "publish"}
        onOpenChange={(open) => { if (!open) close(); }}
        title="نشر العملية"
        description="النشر نهائي: تصبح البيانات غير قابلة للتعديل أو الحذف."
        confirmLabel="نشر"
        pending={publish.isPending}
        onConfirm={() => run("publish")}
      />

      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => { if (!open) close(); }}
        title="حذف العملية"
        description="سيُحذف الملف وبياناته نهائيًا."
        confirmLabel="حذف"
        destructive
        pending={remove.isPending}
        onConfirm={runDelete}
      />

      <ConfirmDialog
        open={dialog === "return"}
        onOpenChange={(open) => { if (!open) close(); }}
        title="إرجاع العملية للمسودة"
        description="أضف ملاحظة توضّح سبب الإرجاع."
        confirmLabel="إرجاع"
        pending={returnToDraft.isPending}
        confirmDisabled={note.trim().length < 3}
        onConfirm={runReturn}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-note">ملاحظة الإرجاع</Label>
          <Textarea
            id="review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="مثال: يرجى مراجعة قيم المصروفات في يوليو"
            maxLength={1000}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
